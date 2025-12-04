import React, { useMemo, useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

const WORD_PROBLEM_TYPES = ['candy', 'paper', 'pencil'];

const randomProblem = () => {
  const dividend = Math.floor(Math.random() * 90) + 10; // 10~99
  const divisor = Math.floor(Math.random() * 8) + 2; // 2~9
  const type =
    WORD_PROBLEM_TYPES[Math.floor(Math.random() * WORD_PROBLEM_TYPES.length)];
  return { dividend, divisor, type };
};

const createBlocks = (dividend) => {
  const tens = Math.floor(dividend / 10);
  const ones = dividend % 10;
  const blocks = [];
  let id = 1;
  for (let i = 0; i < tens; i += 1) {
    blocks.push({ id: `t${id++}`, type: 'ten', containerId: 'source' });
  }
  for (let i = 0; i < ones; i += 1) {
    blocks.push({ id: `o${id++}`, type: 'one', containerId: 'source' });
  }
  return blocks;
};

const Block = ({ id, type }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  const base =
    'flex items-center justify-center rounded-md cursor-grab active:cursor-grabbing transition-transform shadow-md';

  const tenStyle =
    'w-6 sm:w-7 bg-gradient-to-br from-emerald-200 via-emerald-300 to-emerald-400 border border-emerald-500 flex items-stretch justify-stretch px-0.5 py-1 shadow-[2px_4px_0_rgba(16,185,129,0.5)]';
  const oneStyle =
    'w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 border border-purple-500 shadow-[1px_2px_0_rgba(147,51,234,0.5)]';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${base} ${type === 'ten' ? tenStyle : oneStyle} ${
        isDragging ? 'scale-110 ring-2 ring-offset-2 ring-sky-400 z-10' : ''
      }`}
    >
      {type === 'ten' ? (
        <div className="w-full h-full grid grid-rows-10 gap-[1px]">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              className="w-full aspect-square rounded-[1px] bg-emerald-100/80 border border-emerald-300/80"
            />
          ))}
        </div>
      ) : (
        <div className="w-full h-full rounded-[2px]" />
      )}
    </div>
  );
};

const Plate = ({ id, label, children, highlight }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[80px] sm:min-h-[120px] rounded-2xl border-4 border-dashed bg-white/80 flex flex-col p-3 gap-2 transition-colors ${
        isOver ? 'border-sky-500 bg-sky-50' : 'border-pastelBlue'
      } ${highlight ? 'ring-4 ring-emerald-400' : ''}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-base sm:text-lg font-bold text-sky-800">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
};

const SourceArea = ({ blocks }) => {
  return (
    <div className="rounded-2xl bg-white/80 border-4 border-pastelPink px-4 py-3 sm:px-6 sm:py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-lg sm:text-xl font-bold text-pink-700">수모형 상자</span>
        <span className="text-xs sm:text-sm text-pink-700/80">
          위 블록을 아래 접시에 골고루 나누어 담아 보세요.
        </span>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {blocks.map((b) => (
          <Block key={b.id} id={b.id} type={b.type} />
        ))}
      </div>
      <div className="mt-1 flex gap-4 text-xs sm:text-sm text-slate-700">
        <div className="flex items-center gap-1">
          <div className="w-6 h-3 rounded bg-pastelGreen border border-emerald-400" />
          <span>십 모형 (10)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-pastelPurple border border-purple-400" />
          <span>일 모형 (1)</span>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [problem, setProblem] = useState(() => randomProblem());
  const [equationDividend, setEquationDividend] = useState('');
  const [equationDivisor, setEquationDivisor] = useState('');
  const [equationError, setEquationError] = useState('');
  const [equationCorrect, setEquationCorrect] = useState(false);
  const [blocks, setBlocks] = useState(() => createBlocks(problem.dividend));

  const quotient = useMemo(
    () => Math.floor(problem.dividend / problem.divisor),
    [problem.dividend, problem.divisor]
  );

  const storyText = useMemo(() => {
    const { dividend, divisor, type } = problem;
    if (type === 'candy') {
      return `사탕 ${dividend}개를 ${divisor}명의 친구에게 똑같이 나누어 주려고 합니다.`;
    }
    if (type === 'paper') {
      return `색종이 ${dividend}장을 ${divisor}명이 똑같이 나누어 가집니다.`;
    }
    // pencil
    return `연필 ${dividend}자루를 ${divisor}개의 필통에 똑같이 나누어 담습니다.`;
  }, [problem]);

  const handleCheckEquation = () => {
    const { dividend, divisor } = problem;

    if (!equationDividend || !equationDivisor) {
      setEquationError('숫자를 모두 입력해 보세요.');
      return;
    }

    const a = Number(equationDividend);
    const b = Number(equationDivisor);

    if (Number.isNaN(a) || Number.isNaN(b)) {
      setEquationError('숫자만 입력해 보세요.');
      return;
    }

    if (a === dividend && b === divisor) {
      setEquationCorrect(true);
      setEquationError('');
    } else {
      setEquationError('문제를 다시 읽고 숫자를 정확히 넣어보세요.');
    }
  };

  const resetProblem = () => {
    const next = randomProblem();
    setProblem(next);
    setEquationDividend('');
    setEquationDivisor('');
    setEquationError('');
    setEquationCorrect(false);
    setBlocks(createBlocks(next.dividend));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id;
    const droppableIds = ['source', ...Array.from({ length: problem.divisor }, (_, i) => `plate-${i}`)];
    if (!droppableIds.includes(overId)) return;

    setBlocks((prev) =>
      prev.map((b) => (b.id === active.id ? { ...b, containerId: overId } : b))
    );
  };

  const byContainer = useMemo(() => {
    const map = new Map();
    ['source', ...Array.from({ length: problem.divisor }, (_, i) => `plate-${i}`)].forEach((id) =>
      map.set(id, [])
    );
    blocks.forEach((b) => {
      if (!map.has(b.containerId)) map.set(b.containerId, []);
      map.get(b.containerId).push(b);
    });
    return map;
  }, [blocks, problem.divisor]);

  const allPlaced = blocks.every((b) => b.containerId !== 'source');
  const perPlateCounts = Array.from({ length: problem.divisor }, (_, i) => {
    const items = byContainer.get(`plate-${i}`) ?? [];
    const total = items.reduce((sum, b) => sum + (b.type === 'ten' ? 10 : 1), 0);
    return { items, total };
  });
  const everySameAndCorrect =
    perPlateCounts.every((p) => p.total === quotient) &&
    perPlateCounts.length > 0 &&
    allPlaced;

  return (
    <div className="rounded-3xl bg-white/80 shadow-xl border-4 border-pastelBlue/60 flex flex-col gap-4 sm:gap-6">
      {/* 상단: 문제 제시 + 식 입력 */}
      <div className="rounded-t-3xl bg-gradient-to-r from-pastelBlue via-pastelPurple to-pastelPink px-5 py-4 sm:px-8 sm:py-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-xl">
            <p className="text-xs sm:text-sm font-semibold text-sky-900/80">
              오늘의 문장제 나눗셈 문제
            </p>
            <p className="mt-1 text-sm sm:text-lg font-semibold text-sky-950">
              {storyText}
            </p>
            <p className="mt-1 text-[11px] sm:text-xs text-sky-900/80">
              (이 상황을 보고 나눗셈 식을 스스로 세워 보세요.)
            </p>
          </div>
          <button
            type="button"
            onClick={resetProblem}
            className="px-3 py-2 sm:px-4 sm:py-2 rounded-full bg-white/90 text-sm sm:text-base font-semibold text-sky-800 shadow hover:bg-sky-50 active:scale-95 transition"
          >
            다른 문제
          </button>
        </div>

        <div className="bg-white/90 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3">
          <p className="text-sm sm:text-base font-semibold text-slate-800">
            1단계. 문장을 보고 알맞은 나눗셈 식을 세워 보세요.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <input
                type="number"
                className="w-20 sm:w-24 rounded-xl border-2 border-pastelBlue px-2 py-2 text-lg sm:text-2xl font-bold text-center text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 disabled:bg-slate-100"
                placeholder="?"
                value={equationDividend}
                onChange={(e) => setEquationDividend(e.target.value)}
                disabled={equationCorrect}
              />
              <span className="text-xl sm:text-3xl font-extrabold text-slate-800">÷</span>
              <input
                type="number"
                className="w-20 sm:w-24 rounded-xl border-2 border-pastelBlue px-2 py-2 text-lg sm:text-2xl font-bold text-center text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 disabled:bg-slate-100"
                placeholder="?"
                value={equationDivisor}
                onChange={(e) => setEquationDivisor(e.target.value)}
                disabled={equationCorrect}
              />
              <span className="text-xl sm:text-3xl font-extrabold text-slate-800">= ?</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCheckEquation}
                disabled={equationCorrect}
                className={`px-4 py-2 rounded-xl text-base sm:text-lg font-bold shadow transition ${
                  equationCorrect
                    ? 'bg-emerald-400 text-emerald-950 cursor-default'
                    : 'bg-sky-500 text-white hover:bg-sky-600 active:scale-95'
                }`}
              >
                {equationCorrect ? '잘했어요! 🎉' : '식 세우기 확인'}
              </button>
              {!equationCorrect && (
                <p className="text-xs sm:text-sm text-slate-600">
                  힌트: 전체 수를 앞 칸에, 나누는 사람(또는 칸)의 수를 뒤 칸에 써 보세요.
                </p>
              )}
            </div>
            {equationError && (
              <p className="text-xs sm:text-sm text-rose-600 font-semibold">
                {equationError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 하단: 수모형 조작 */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-6 flex flex-col gap-4 sm:gap-5">
        <p className="text-sm sm:text-base font-semibold text-slate-800">
          2단계. 수모형을 끌어서 아래 접시에 똑같이 나누어 담아 보세요.
        </p>

        {equationCorrect ? (
          <>
            <DndContext onDragEnd={handleDragEnd}>
              {/* 위쪽 영역: source */}
              <SourceArea blocks={byContainer.get('source') ?? []} />

              {/* 아래쪽 영역: plates */}
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base font-semibold text-slate-800">
                    나누는 수:{' '}
                    <span className="text-xl sm:text-2xl font-extrabold text-sky-700">
                      {problem.divisor}
                    </span>{' '}
                    개의 접시
                  </span>
                  <span className="text-xs sm:text-sm text-slate-600">
                    각 접시에 들어가야 하는 수:{' '}
                    <span className="font-bold text-emerald-700">{quotient}</span>
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  {perPlateCounts.map((plate, index) => (
                    <Plate
                      key={index}
                      id={`plate-${index}`}
                      label={`${index + 1}번 접시`}
                      highlight={everySameAndCorrect && plate.total === quotient}
                    >
                      {plate.items.map((b) => (
                        <Block key={b.id} id={b.id} type={b.type} />
                      ))}
                      <div className="mt-2 text-xs sm:text-sm text-slate-700">
                        합계:{' '}
                        <span className="font-bold text-slate-900">
                          {plate.total}
                        </span>
                      </div>
                    </Plate>
                  ))}
                </div>
              </div>
            </DndContext>

            {/* 피드백 영역 */}
            <div className="mt-2 rounded-2xl bg-white/90 border-2 border-pastelGreen px-4 py-3 flex flex-col gap-1">
              {everySameAndCorrect ? (
                <>
                  <p className="text-lg sm:text-xl font-extrabold text-emerald-700">
                    완벽해요! 🎉
                  </p>
                  <p className="text-sm sm:text-base text-slate-800">
                    모든 접시에 <span className="font-bold">{quotient}</span>씩 똑같이 나누어 담았어요.
                    그래서{' '}
                    <span className="font-bold">
                      {problem.dividend} ÷ {problem.divisor} = {quotient}
                    </span>{' '}
                    입니다.
                  </p>
                </>
              ) : allPlaced ? (
                <p className="text-sm sm:text-base text-amber-800">
                  블록은 모두 접시에 들어갔지만, 아직 똑같이 나누어지지 않았어요. 각 접시의 합계를 다시 비교해 볼까요?
                </p>
              ) : (
                <p className="text-sm sm:text-base text-slate-800">
                  모든 블록을 아래 접시에 옮긴 뒤, 각 접시에 들어간 수가 똑같은지 살펴보세요.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="mt-2 rounded-2xl bg-white/70 border-2 border-dashed border-pastelBlue px-4 py-4 text-sm sm:text-base text-slate-600 flex flex-col gap-1">
            <p className="font-semibold text-slate-700">
              먼저 1단계에서 문장을 보고 알맞은 나눗셈 식을 세워 보세요.
            </p>
            <p>
              식을 올바르게 입력하면, 이 아래에서 수모형을 직접 끌어서 나누어 볼 수 있어요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;


