import React, { useMemo, useState } from 'react';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

const createBlocks = (dividend) => {
  const hundreds = Math.floor(dividend / 100);
  const tens = Math.floor((dividend % 100) / 10);
  const ones = dividend % 10;
  const blocks = [];
  let id = 1;
  for (let i = 0; i < hundreds; i += 1) {
    blocks.push({ id: `h${id++}`, type: 'hundred', containerId: 'source' });
  }
  for (let i = 0; i < tens; i += 1) {
    blocks.push({ id: `t${id++}`, type: 'ten', containerId: 'source' });
  }
  for (let i = 0; i < ones; i += 1) {
    blocks.push({ id: `o${id++}`, type: 'one', containerId: 'source' });
  }
  return blocks;
};

const getBlockValue = (type) => {
  if (type === 'hundred') return 100;
  if (type === 'ten') return 10;
  return 1;
};

// 세로셈 계산 단계 생성
const computeLongDivisionSteps = (dividend, divisor) => {
  if (!divisor || !dividend) return [];
  const dividendStr = String(dividend);
  const digits = dividendStr.split('').map((d) => Number(d));
  let remainder = 0;
  const steps = [];
  
  digits.forEach((digit, idx) => {
    const current = remainder * 10 + digit;
    const qDigit = Math.floor(current / divisor);
    const product = qDigit * divisor;
    const nextRemainder = current - product;
    steps.push({
      position: idx,
      bringDown: current,
      digit,
      qDigit,
      product,
      remainder: nextRemainder,
    });
    remainder = nextRemainder;
  });
  return steps;
};

const Block = ({ id, type, onClick, isHammerMode }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  const base =
    'flex items-center justify-center rounded-full transition-transform shadow-md select-none';

  const hundredStyle =
    'w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-200 via-emerald-300 to-emerald-400 border-2 border-emerald-500 text-base sm:text-lg font-extrabold text-emerald-900 shadow-[2px_4px_0_rgba(16,185,129,0.5)]';
  const tenStyle =
    'w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-sky-200 via-sky-300 to-sky-400 border-2 border-sky-500 text-sm sm:text-base font-extrabold text-sky-900 shadow-[2px_4px_0_rgba(59,130,246,0.5)]';
  const oneStyle =
    'w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400 border-2 border-purple-500 text-xs sm:text-sm font-bold text-purple-900 shadow-[1px_2px_0_rgba(147,51,234,0.5)]';

  const handleClick = () => {
    if (onClick) onClick(id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isHammerMode ? {} : listeners)}
      {...attributes}
      onClick={handleClick}
      className={`${base} ${
        type === 'hundred' ? hundredStyle : type === 'ten' ? tenStyle : oneStyle
      } ${
        isDragging ? 'scale-110 ring-2 ring-offset-2 ring-sky-400 z-10' : ''
      }`}
    >
      {type === 'hundred' ? '100' : type === 'ten' ? '10' : '1'}
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

const SourceArea = ({ blocks, onBlockClick, isHammerMode }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: 'source',
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl bg-white/80 border-4 px-4 py-3 sm:px-6 sm:py-4 flex flex-col gap-3 transition-colors ${
        isOver ? 'border-sky-500 bg-sky-50' : 'border-pastelPink'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg sm:text-xl font-bold text-pink-700">수모형 상자</span>
        <span className="text-xs sm:text-sm text-pink-700/80">
          위 블록을 아래 접시에 골고루 나누어 담아 보세요.
        </span>
      </div>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {blocks.map((b) => (
          <Block
            key={b.id}
            id={b.id}
            type={b.type}
            onClick={onBlockClick}
            isHammerMode={isHammerMode}
          />
        ))}
      </div>
      <div className="mt-1 flex gap-4 text-xs sm:text-sm text-slate-700">
        <div className="flex items-center gap-1">
          <div className="w-5 h-5 rounded-full bg-emerald-300 border border-emerald-500" />
          <span>백 모형 (100)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded-full bg-sky-300 border border-sky-500" />
          <span>십 모형 (10)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-purple-300 border border-purple-500" />
          <span>일 모형 (1)</span>
        </div>
      </div>
    </div>
  );
};

// 세로셈 표 형식 컴포넌트
const LongDivisionGrid = ({ dividend, divisor, steps, completedSteps }) => {
  const digits = String(dividend).split('').map((d) => Number(d));
  const numDigits = digits.length;
  
  // 몫의 각 자릿수
  const quotientDigits = steps.map((s) => s.qDigit);
  
  // 세로셈 셀 스타일
  const cellStyle = 'w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold border border-slate-300 bg-white rounded-lg';
  const emptyCellStyle = 'w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold border border-dashed border-slate-300 bg-slate-50 rounded-lg';
  const spacerStyle = 'w-10 h-10 sm:w-12 sm:h-12';
  
  // 숫자를 자릿수별로 분리 (예: 18 → ['1', '8'], 6 → ['', '6'] with width 2)
  const getDigitAt = (num, totalWidth, position) => {
    const str = String(num).padStart(totalWidth, ' ');
    const char = str[position];
    return char === ' ' ? '' : char;
  };
  
  return (
    <div className="flex flex-col items-center gap-1">
      {/* 몫 행 (맨 위) */}
      <div className="flex items-center gap-1">
        <div className={spacerStyle} /> {/* 나누는 수 자리 빈 공간 */}
        <div className="w-4 sm:w-6" /> {/* 괄호 자리 빈 공간 */}
        {digits.map((_, idx) => (
          <div
            key={`q-${idx}`}
            className={completedSteps > idx ? cellStyle : emptyCellStyle}
          >
            {completedSteps > idx ? quotientDigits[idx] : ''}
          </div>
        ))}
      </div>
      
      {/* 나눗셈 기호와 나눠지는 수 행 */}
      <div className="flex items-center gap-1">
        {/* 나누는 수 */}
        <div className={cellStyle}>
          {divisor}
        </div>
        {/* 괄호 기호 ) */}
        <div className="w-4 sm:w-6 h-10 sm:h-12 flex items-center justify-center text-2xl sm:text-3xl font-bold text-slate-700">
          )
        </div>
        {/* 나눠지는 수 각 자릿수 */}
        {digits.map((d, idx) => (
          <div
            key={`d-${idx}`}
            className={`${cellStyle} border-t-2 border-t-slate-700`}
          >
            {d}
          </div>
        ))}
      </div>
      
      {/* 계산 과정 (각 단계별) */}
      {steps.map((step, stepIdx) => {
        if (completedSteps <= stepIdx) return null;
        
        // product와 remainder의 자릿수 계산
        const productStr = String(step.product);
        const productLen = productStr.length;
        
        // bringDown(이전 나머지 × 10 + 현재 자리)의 자릿수
        const bringDownStr = String(step.bringDown);
        const bringDownLen = bringDownStr.length;
        
        return (
          <div key={`step-${stepIdx}`} className="flex flex-col gap-1">
            {/* 빼는 수 (곱) - 자릿수별로 분리해서 표시 */}
            <div className="flex items-center gap-1">
              <div className={spacerStyle} />
              <div className="w-4 sm:w-6" />
              {digits.map((_, idx) => {
                // product가 시작되는 열 계산 (product 끝이 stepIdx 열에 맞춰짐)
                const productStartCol = stepIdx - (productLen - 1);
                const positionInProduct = idx - productStartCol;
                
                if (positionInProduct >= 0 && positionInProduct < productLen) {
                  const digitChar = productStr[positionInProduct];
                  return (
                    <div key={`sub-${stepIdx}-${idx}`} className={`${cellStyle} bg-rose-50 border-rose-300`}>
                      {digitChar}
                    </div>
                  );
                }
                return <div key={`sub-${stepIdx}-${idx}`} className={spacerStyle} />;
              })}
            </div>
            
            {/* 빼기 선 */}
            <div className="flex items-center gap-1">
              <div className={spacerStyle} />
              <div className="w-4 sm:w-6" />
              {digits.map((_, idx) => {
                const productStartCol = stepIdx - (productLen - 1);
                if (idx >= productStartCol && idx <= stepIdx) {
                  return <div key={`line-${stepIdx}-${idx}`} className="w-10 sm:w-12 border-b-2 border-slate-700" />;
                }
                return <div key={`line-${stepIdx}-${idx}`} className={spacerStyle} />;
              })}
            </div>
            
            {/* 나머지 + 다음 자리 내림 */}
            <div className="flex items-center gap-1">
              <div className={spacerStyle} />
              <div className="w-4 sm:w-6" />
              {digits.map((_, idx) => {
                // 마지막 단계가 아니면 나머지 + 다음 자리 표시
                if (stepIdx < steps.length - 1) {
                  // 다음 단계의 bringDown을 표시
                  const nextBringDown = steps[stepIdx + 1].bringDown;
                  const nextBringDownStr = String(nextBringDown);
                  const nextLen = nextBringDownStr.length;
                  
                  // bringDown이 끝나는 열 = stepIdx + 1
                  const bringDownStartCol = (stepIdx + 1) - (nextLen - 1);
                  const posInBringDown = idx - bringDownStartCol;
                  
                  if (posInBringDown >= 0 && posInBringDown < nextLen) {
                    const digitChar = nextBringDownStr[posInBringDown];
                    // 첫 번째 자리는 나머지(하늘색), 마지막 자리는 내림(노란색)
                    const isLastDigit = posInBringDown === nextLen - 1;
                    const bgColor = isLastDigit ? 'bg-amber-50 border-amber-300' : 'bg-sky-50 border-sky-300';
                    return (
                      <div key={`rem-${stepIdx}-${idx}`} className={`${cellStyle} ${bgColor}`}>
                        {digitChar}
                      </div>
                    );
                  }
                } else {
                  // 마지막 단계: 최종 나머지만 표시
                  const remainderStr = String(step.remainder);
                  const remLen = remainderStr.length;
                  const remStartCol = stepIdx - (remLen - 1);
                  const posInRem = idx - remStartCol;
                  
                  if (posInRem >= 0 && posInRem < remLen) {
                    const digitChar = remainderStr[posInRem];
                    return (
                      <div key={`rem-${stepIdx}-${idx}`} className={`${cellStyle} bg-emerald-50 border-emerald-300`}>
                        {digitChar}
                      </div>
                    );
                  }
                }
                return <div key={`rem-${stepIdx}-${idx}`} className={spacerStyle} />;
              })}
            </div>
          </div>
        );
      })}
      
      {/* 최종 나머지 (마지막 단계 완료 시) */}
      {completedSteps === steps.length && steps.length > 0 && (
        <div className="mt-2 text-center">
          <span className="text-sm font-semibold text-slate-700">
            나머지: <span className="text-lg font-bold text-emerald-700">{steps[steps.length - 1].remainder}</span>
          </span>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [equationDividend, setEquationDividend] = useState('');
  const [equationDivisor, setEquationDivisor] = useState('');
  const [estimate, setEstimate] = useState('');
  const [estimateError, setEstimateError] = useState('');
  const [estimateSubmitted, setEstimateSubmitted] = useState(false);
  const [toolMode, setToolMode] = useState('none');
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [blocks3, setBlocks3] = useState([]);
  const [blocks4, setBlocks4] = useState([]);
  const [step3Completed, setStep3Completed] = useState(false);
  const [step4Started, setStep4Started] = useState(false);

  const dividendNum = Number(equationDividend);
  const divisorNum = Number(equationDivisor);
  const hasEquation =
    equationDividend !== '' &&
    equationDivisor !== '' &&
    !Number.isNaN(dividendNum) &&
    !Number.isNaN(divisorNum) &&
    divisorNum > 0;

  const problem = useMemo(() => {
    if (hasEquation) {
      return { dividend: dividendNum, divisor: divisorNum };
    }
    return { dividend: 0, divisor: 1 };
  }, [hasEquation, dividendNum, divisorNum]);

  const quotient = useMemo(
    () => (problem.divisor ? Math.floor(problem.dividend / problem.divisor) : 0),
    [problem.dividend, problem.divisor]
  );

  useMemo(() => {
    if (hasEquation) {
      setBlocks3(createBlocks(dividendNum));
      setEstimate('');
      setEstimateError('');
      setEstimateSubmitted(false);
      setStep3Completed(false);
      setStep4Started(false);
      setBlocks4([]);
      setToolMode('none');
    }
  }, [hasEquation, dividendNum, divisorNum]);

  const handleEstimateSubmit = () => {
    if (!estimate) {
      setEstimateError('어림한 값을 써 보세요.');
      return;
    }
    const num = Number(estimate);
    if (Number.isNaN(num)) {
      setEstimateError('숫자로 어림한 값을 써 보세요.');
      return;
    }
    setEstimateError('');
    setEstimateSubmitted(true);
  };

  const currentBlocks = step4Started ? blocks4 : blocks3;
  const setCurrentBlocks = step4Started ? setBlocks4 : setBlocks3;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const overId = over.id;
    const droppableIds = ['source', ...Array.from({ length: problem.divisor }, (_, i) => `plate-${i}`)];
    if (!droppableIds.includes(overId)) return;

    setCurrentBlocks((prev) =>
      prev.map((b) => (b.id === active.id ? { ...b, containerId: overId } : b))
    );
  };

  const byContainer = useMemo(() => {
    const map = new Map();
    ['source', ...Array.from({ length: problem.divisor }, (_, i) => `plate-${i}`)].forEach((id) =>
      map.set(id, [])
    );
    currentBlocks.forEach((b) => {
      if (!map.has(b.containerId)) map.set(b.containerId, []);
      map.get(b.containerId).push(b);
    });
    return map;
  }, [currentBlocks, problem.divisor]);

  const allPlaced = currentBlocks.length > 0 && currentBlocks.every((b) => b.containerId !== 'source');
  const perPlateCounts = Array.from({ length: problem.divisor }, (_, i) => {
    const items = byContainer.get(`plate-${i}`) ?? [];
    const total = items.reduce((sum, b) => sum + getBlockValue(b.type), 0);
    return { items, total };
  });
  const everySameAndCorrect =
    perPlateCounts.every((p) => p.total === quotient) &&
    perPlateCounts.length > 0 &&
    allPlaced;

  const handleBlockClick = (blockId) => {
    if (toolMode !== 'hammer') return;

    setCurrentBlocks((prev) => {
      const target = prev.find((b) => b.id === blockId);
      if (!target) return prev;
      const others = prev.filter((b) => b.id !== blockId);

      if (target.type === 'hundred') {
        const additions = Array.from({ length: 10 }).map((_, idx) => ({
          id: `${target.id}-t${idx}`,
          type: 'ten',
          containerId: target.containerId,
        }));
        return [...others, ...additions];
      }
      if (target.type === 'ten') {
        const additions = Array.from({ length: 10 }).map((_, idx) => ({
          id: `${target.id}-o${idx}`,
          type: 'one',
          containerId: target.containerId,
        }));
        return [...others, ...additions];
      }
      return prev;
    });
  };

  const handleMergeAll = () => {
    const containers = ['source', ...Array.from({ length: problem.divisor }, (_, i) => `plate-${i}`)];
    const nextBlocks = [];

    containers.forEach((cid) => {
      const inContainer = currentBlocks.filter((b) => b.containerId === cid);
      let hundredCount = inContainer.filter((b) => b.type === 'hundred').length;
      let tenCount = inContainer.filter((b) => b.type === 'ten').length;
      let oneCount = inContainer.filter((b) => b.type === 'one').length;

      const newTenFromOnes = Math.floor(oneCount / 10);
      oneCount %= 10;
      tenCount += newTenFromOnes;

      const newHundredFromTens = Math.floor(tenCount / 10);
      tenCount %= 10;
      hundredCount += newHundredFromTens;

      for (let i = 0; i < hundredCount; i += 1) {
        nextBlocks.push({ id: `h-${cid}-${i}`, type: 'hundred', containerId: cid });
      }
      for (let i = 0; i < tenCount; i += 1) {
        nextBlocks.push({ id: `t-${cid}-${i}`, type: 'ten', containerId: cid });
      }
      for (let i = 0; i < oneCount; i += 1) {
        nextBlocks.push({ id: `o-${cid}-${i}`, type: 'one', containerId: cid });
      }
    });

    setCurrentBlocks(nextBlocks);
    setToolMode('none');
  };

  const resetBlocksToStart = () => {
    setCurrentBlocks(createBlocks(problem.dividend));
    setToolMode('none');
  };

  const moveAllBackToSource = () => {
    setCurrentBlocks((prev) => prev.map((b) => ({ ...b, containerId: 'source' })));
  };

  const handleStartStep4 = () => {
    setStep3Completed(true);
    setStep4Started(true);
    setBlocks4(createBlocks(problem.dividend));
    setToolMode('none');
  };

  const canShowStep2 = hasEquation;
  const canShowStep3 = hasEquation && estimateSubmitted;
  const isHammerMode = toolMode === 'hammer';
  
  const divisionSteps = useMemo(
    () => computeLongDivisionSteps(problem.dividend, problem.divisor),
    [problem.dividend, problem.divisor]
  );

  // 자릿수별 완료 체크
  const equalShareForType = (type) => {
    const total = currentBlocks.filter((b) => b.type === type).length;
    if (total === 0) return true;
    const inSource = currentBlocks.filter((b) => b.type === type && b.containerId === 'source').length;
    if (inSource > 0) return false;
    const counts = Array.from({ length: problem.divisor }, (_, i) => {
      const items = byContainer.get(`plate-${i}`) ?? [];
      return items.filter((b) => b.type === type).length;
    });
    return counts.every((c) => c === counts[0]);
  };

  const hundredsDone = equalShareForType('hundred');
  const tensDone = equalShareForType('ten');
  const onesDone = equalShareForType('one');

  // 세로셈에서 완료된 단계 수 계산
  const completedSteps = useMemo(() => {
    const numDigits = String(problem.dividend).length;
    let completed = 0;
    
    // 3자리수인 경우: 백의 자리 → 십의 자리 → 일의 자리
    // 2자리수인 경우: 십의 자리 → 일의 자리
    if (numDigits === 3) {
      if (hundredsDone) completed = 1;
      if (hundredsDone && tensDone) completed = 2;
      if (hundredsDone && tensDone && onesDone) completed = 3;
    } else if (numDigits === 2) {
      if (tensDone) completed = 1;
      if (tensDone && onesDone) completed = 2;
    } else if (numDigits === 1) {
      if (onesDone) completed = 1;
    }
    
    return completed;
  }, [hundredsDone, tensDone, onesDone, problem.dividend]);

  const ToolBar = () => (
    <div className="mb-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-700">
      <button
        type="button"
        onClick={() => setToolMode((prev) => (prev === 'hammer' ? 'none' : 'hammer'))}
        className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs sm:text-sm font-semibold ${
          toolMode === 'hammer'
            ? 'bg-rose-200 border-rose-400 text-rose-800'
            : 'bg-white border-slate-300 hover:bg-slate-50'
        }`}
      >
        <span>🔨</span>
        <span>망치(쪼개기)</span>
      </button>
      <button
        type="button"
        onClick={handleMergeAll}
        className="flex items-center gap-1 px-3 py-1 rounded-full border bg-white border-slate-300 hover:bg-slate-50 text-xs sm:text-sm font-semibold"
      >
        <span>🧴</span>
        <span>풀(다시 합치기)</span>
      </button>
      <button
        type="button"
        onClick={resetBlocksToStart}
        className="flex items-center gap-1 px-3 py-1 rounded-full border bg-white border-slate-300 hover:bg-slate-50 text-xs sm:text-sm font-semibold"
      >
        <span>🔄</span>
        <span>초기화</span>
      </button>
      <button
        type="button"
        onClick={moveAllBackToSource}
        className="flex items-center gap-1 px-3 py-1 rounded-full border bg-white border-slate-300 hover:bg-slate-50 text-xs sm:text-sm font-semibold"
      >
        <span>📦</span>
        <span>상자로 되돌리기</span>
      </button>
      <span className="ml-auto text-[11px] sm:text-xs text-slate-500">
        망치 모드에서는 100·10 모형을 클릭해서 더 작은 모형으로 쪼갤 수 있어요.
      </span>
    </div>
  );

  const ManipulativeArea = () => (
    <>
      <SourceArea
        blocks={byContainer.get('source') ?? []}
        onBlockClick={handleBlockClick}
        isHammerMode={isHammerMode}
      />

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
                <Block
                  key={b.id}
                  id={b.id}
                  type={b.type}
                  onClick={handleBlockClick}
                  isHammerMode={isHammerMode}
                />
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
    </>
  );

  return (
    <div
      className="rounded-3xl bg-white/80 shadow-xl border-4 border-pastelBlue/60 flex flex-col gap-4 sm:gap-6 relative overflow-hidden"
      onMouseMove={(e) => {
        if (!isHammerMode) return;
        setCursorPos({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* 상단: 문제 제시 + 식 입력 */}
      <div className="rounded-t-3xl bg-gradient-to-r from-pastelBlue via-pastelPurple to-pastelPink px-5 py-4 sm:px-8 sm:py-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="max-w-xl">
            <p className="text-xs sm:text-sm font-semibold text-sky-900/80">
              오늘의 나눗셈 활동
            </p>
            <p className="mt-1 text-sm sm:text-lg font-semibold text-sky-950">
              선생님이 들려주는 서술형(문장제) 문제를 잘 듣고, 알맞은 나눗셈 식을 아래 빈 칸에 세워 보세요.
            </p>
            <p className="mt-1 text-[11px] sm:text-xs text-sky-900/80">
              선생님이 예: "사탕 68개를 2명의 친구에게 똑같이 나누어 주려고 합니다." 와 같이 문제를 말해 주실 거예요.
            </p>
          </div>
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
              />
              <span className="text-xl sm:text-3xl font-extrabold text-slate-800">÷</span>
              <input
                type="number"
                className="w-20 sm:w-24 rounded-xl border-2 border-pastelBlue px-2 py-2 text-lg sm:text-2xl font-bold text-center text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 disabled:bg-slate-100"
                placeholder="?"
                value={equationDivisor}
                onChange={(e) => setEquationDivisor(e.target.value)}
              />
              <span className="text-xl sm:text-3xl font-extrabold text-slate-800">= ?</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs sm:text-sm text-slate-600">
                힌트: 전체 수를 앞 칸에, 나누는 사람(또는 칸)의 수를 뒤 칸에 써 보세요.
              </p>
            </div>
          </div>
        </div>

        {canShowStep2 && (
          <div className="bg-white/90 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3">
            <p className="text-sm sm:text-base font-semibold text-slate-800">
              2단계. 몫이 얼마일지 어림해 보세요.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <input
                  type="number"
                  className="w-24 sm:w-28 rounded-xl border-2 border-pastelBlue px-3 py-2 text-lg sm:text-2xl font-bold text-center text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  placeholder="?"
                  value={estimate}
                  onChange={(e) => {
                    setEstimate(e.target.value);
                    setEstimateSubmitted(false);
                  }}
                />
                <span className="text-sm sm:text-base text-slate-700">이라고 어림했어요.</span>
                <button
                  type="button"
                  onClick={handleEstimateSubmit}
                  className="px-4 py-2 rounded-xl text-base sm:text-lg font-bold shadow bg-amber-400 text-amber-950 hover:bg-amber-500 active:scale-95 transition"
                >
                  어림하기 확인
                </button>
              </div>
              {estimateError && (
                <p className="text-xs sm:text-sm text-rose-600 font-semibold">
                  {estimateError}
                </p>
              )}
              <div className="mt-1 rounded-xl border-2 border-slate-300 bg-slate-50/80 px-3 py-2 sm:px-4 sm:py-3 flex flex-col gap-1">
                <p className="text-xs sm:text-sm font-semibold text-slate-700">AI 피드백</p>
                <div className="h-12 sm:h-16 rounded-lg bg-white/80 border border-dashed border-slate-300 flex items-center justify-center text-[11px] sm:text-xs text-slate-400">
                  나중에 AI가 어림한 값에 대해 피드백을 보여 줄 공간입니다.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단: 수모형 조작 & 세로셈 연결 */}
      {canShowStep2 && (
        <div className="px-4 pb-4 sm:px-6 sm:pb-6 flex flex-col gap-4 sm:gap-5">
          
          {/* 3단계 */}
          {!step4Started && (
            <>
              <p className="text-sm sm:text-base font-semibold text-slate-800">
                3단계. 수모형을 끌어서 아래 접시에 똑같이 나누어 담아 보세요.
              </p>

              {canShowStep3 ? (
                <>
                  <DndContext onDragEnd={handleDragEnd}>
                    <ToolBar />
                    <ManipulativeArea />

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
                          <button
                            type="button"
                            onClick={handleStartStep4}
                            className="mt-2 px-4 py-2 rounded-xl text-base sm:text-lg font-bold shadow bg-pastelBlue text-sky-900 hover:bg-sky-200 active:scale-95 transition self-start"
                          >
                            4단계로 가기 →
                          </button>
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
                  </DndContext>
                </>
              ) : (
                <div className="mt-2 rounded-2xl bg-white/70 border-2 border-dashed border-pastelBlue px-4 py-4 text-sm sm:text-base text-slate-600 flex flex-col gap-1">
                  <p className="font-semibold text-slate-700">
                    먼저 2단계에서 몫을 어림해 본 뒤, 3단계에서 수모형을 이용해 실제로 나누어 볼 수 있어요.
                  </p>
                  <p>
                    어림하기를 마치면, 이 아래에서 수모형을 직접 끌어서 나누어 보고,
                    세로셈과도 연결해 볼 수 있어요.
                  </p>
                </div>
              )}
            </>
          )}

          {/* 4단계 */}
          {step4Started && (
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="text-sm sm:text-base font-semibold text-slate-800">
                4단계. 수모형을 자릿값으로 묶어서 세로셈과 연결해 보세요.
              </p>

              <div className="flex flex-col lg:flex-row gap-4">
                {/* 왼쪽: 수모형 조작 영역 */}
                <div className="flex-1 rounded-2xl border-2 border-pastelPink bg-white/90 px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3">
                  <DndContext onDragEnd={handleDragEnd}>
                    <ToolBar />
                    <ManipulativeArea />
                  </DndContext>
                </div>

                {/* 오른쪽: 세로셈 표 형식 */}
                <div className="w-full lg:w-auto rounded-2xl border-2 border-pastelBlue bg-white/90 px-4 py-3 sm:px-5 sm:py-4 flex flex-col gap-3">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 mb-2">
                    세로셈
                  </p>
                  
                  <LongDivisionGrid
                    dividend={problem.dividend}
                    divisor={problem.divisor}
                    steps={divisionSteps}
                    completedSteps={completedSteps}
                  />

                  {/* 완료 피드백 */}
                  {everySameAndCorrect && (
                    <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-300 px-3 py-2">
                      <p className="text-sm font-bold text-emerald-700">🎉 세로셈 완성!</p>
                      <p className="text-xs text-slate-700">
                        {problem.dividend} ÷ {problem.divisor} = {quotient}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {isHammerMode && (
        <div
          className="pointer-events-none fixed z-50 text-xl sm:text-2xl"
          style={{ left: cursorPos.x + 2, top: cursorPos.y + 10 }}
        >
          🔨
        </div>
      )}
    </div>
  );
};

export default App;
