import React, { useState, useEffect } from 'react';
import { RotateCcw, Stethoscope, Microscope, AlertCircle, Loader2, Image as ImageIcon, Database, ServerCrash, TrendingUp } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { LossDashboard } from './components/LossDashboard';
import { DrugList } from './components/DrugList';
import { Drug, DrugComparison } from './types';
import { getAlternatives, loadStaticDB } from './services/drugService';

export default function App() {
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [comparisonData, setComparisonData] = useState<DrugComparison | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dataDate, setDataDate] = useState<string>('');
  const [dataCount, setDataCount] = useState<number>(0);

  // Initial Data Load Check
  useEffect(() => {
    loadStaticDB().then(data => {
      if (data) {
        setDataDate(data.lastUpdated);
        setDataCount(data.totalCount);
      }
    });
  }, []);

  // Async logic to process the selection and find alternatives
  useEffect(() => {
    async function fetchComparison() {
      if (!selectedDrug) {
        setComparisonData(null);
        return;
      }

      setIsAnalyzing(true);
      try {
        // Find all drugs with the same ingredient code
        const alternatives = await getAlternatives(selectedDrug.ingredientCode);

        if (alternatives.length === 0) {
          setComparisonData(null);
        } else {
          const cheapest = alternatives[0];
          const savingsPerPill = selectedDrug.price - cheapest.price;

          setComparisonData({
            original: selectedDrug,
            cheapest,
            alternatives,
            savingsPerPill
          });
        }
      } catch (error) {
        console.error("Failed to analyze drug:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }

    fetchComparison();
  }, [selectedDrug]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setSelectedDrug(null)}>
            <div className="bg-medical-500 p-1.5 md:p-2 rounded-lg shadow-sm">
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg md:text-xl font-bold text-slate-800 tracking-tight leading-none">
                약-<span className="text-medical-500">테크</span>
              </span>
              <span className="text-[0.6rem] text-slate-400 font-medium tracking-wide">Yak-Tech</span>
            </div>
          </div>
          {selectedDrug && (
             <button 
               onClick={() => setSelectedDrug(null)}
               className="text-xs md:text-sm text-slate-500 hover:text-medical-600 flex items-center transition-colors bg-slate-100 px-3 py-1.5 rounded-full"
             >
               <RotateCcw className="w-3 h-3 md:w-4 md:h-4 mr-1" />
               처음으로
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {!selectedDrug ? (
          /* Landing State */
          <div className="flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh] text-center space-y-6 md:space-y-8 animate-fade-in-up">
            <div className="space-y-3 md:space-y-4 max-w-2xl px-2">
              <div className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-indigo-50 text-indigo-700 text-xs md:text-sm font-semibold mb-2 shadow-sm border border-indigo-100">
                <Microscope className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                @acedoctor2026
              </div>
              <h1 className="text-3xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight break-keep">
                약값도 자산이다.<br/>
                <span className="text-medical-500">현명한 약-테크 시작하기</span>
              </h1>
              <p className="text-base md:text-xl text-slate-600 max-w-xl mx-auto break-keep leading-relaxed">
                "성분은 같은데 가격은 왜 다를까요?"<br className="hidden md:block"/>
                빅데이터로 분석한 <span className="font-bold text-slate-800">최저가 처방 포트폴리오</span>를 제안합니다.
              </p>
            </div>

            <div className="w-full max-w-2xl mt-6 md:mt-10">
              <SearchBar onSelectDrug={setSelectedDrug} />
              
              <div className="mt-6 md:mt-8">
                 {!dataDate ? (
                   <div className="inline-flex flex-col md:flex-row items-center px-4 py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs text-center md:text-left gap-1">
                     <div className="flex items-center">
                        <ServerCrash className="w-3 h-3 mr-1.5" />
                        <strong>로컬 모드 (Mock Data)</strong>
                     </div>
                     <span className="hidden md:inline mx-1">|</span>
                     <span>실제 데이터는 배포 후 Github Action이 생성합니다.</span>
                   </div>
                 ) : (
                   <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs">
                     <Database className="w-3 h-3 mr-1.5" />
                     <span><strong>심평원 실거래가</strong> 연동됨 ({dataCount.toLocaleString()}개 / {dataDate} 기준)</span>
                   </div>
                 )}
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs md:text-sm text-gray-400">
                <span>인기 종목(?):</span>
                <span className="hover:text-medical-500 underline decoration-dotted cursor-pointer">타이레놀</span>
                <span className="hover:text-medical-500 underline decoration-dotted cursor-pointer">쎄레브렉스</span>
                <span className="hover:text-medical-500 underline decoration-dotted cursor-pointer">오팔몬</span>
              </div>
            </div>
          </div>
        ) : (
          /* Result State */
          <div className="space-y-6 md:space-y-8 animate-fade-in">
             <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
                   {/* Drug Image */}
                   <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden mx-auto md:mx-0">
                      {selectedDrug.image ? (
                        <img src={selectedDrug.image} alt={selectedDrug.name} className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-8 h-8 md:w-10 md:h-10 text-gray-300" />
                      )}
                   </div>

                   <div className="flex-1 w-full">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-center md:justify-start">
                        <Stethoscope className="w-3 h-3 mr-1 text-medical-500" />
                        분석 대상 (Target Asset)
                      </span>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2 break-keep leading-tight">
                        {selectedDrug.name}
                      </h2>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {selectedDrug.manufacturer}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {selectedDrug.ingredientName}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center md:justify-end items-baseline">
                        <span className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">
                          {selectedDrug.price.toLocaleString()}
                        </span>
                        <span className="text-sm md:text-base text-gray-500 ml-1 font-medium">원 / 1정</span>
                      </div>
                   </div>
                </div>
             </div>

             {isAnalyzing ? (
               <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                 <Loader2 className="w-10 h-10 text-medical-500 animate-spin mb-4" />
                 <p className="text-gray-500">최저가 포트폴리오 분석 중...</p>
               </div>
             ) : comparisonData && (
               <>
                 <LossDashboard comparison={comparisonData} />
                 <DrugList 
                   currentDrug={selectedDrug} 
                   alternatives={comparisonData.alternatives} 
                 />
               </>
             )}
          </div>
        )}

      </main>

      {/* Footer / Disclaimer */}
      <footer className="bg-slate-900 text-slate-400 py-8 md:py-12 mt-8 md:mt-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div className="space-y-3 w-full">
              <h3 className="text-white font-bold text-base md:text-lg">투자 유의사항 (Medical Disclaimer)</h3>
              <p className="text-xs md:text-sm leading-relaxed text-slate-400 break-keep">
                본 서비스는 심평원 공공 데이터를 기반으로 '약가 정보'만 제공하는 참고용 도구입니다. 
                동일 성분이라도 첨가제, 제형, 생체 이용률에 따라 효능/부작용 차이가 발생할 수 있습니다.
                <br /><br />
                <span className="text-white font-bold underline">투약 변경은 반드시 전문의/약사와 상담 후 결정해야 합니다.</span>
                본 정보만 믿고 임의로 약을 끊거나 바꾸는 '뇌동매매' 식의 판단은 건강에 치명적일 수 있습니다.
              </p>
              <div className="pt-4 border-t border-slate-800 flex flex-col md:flex-row justify-between text-[10px] md:text-xs gap-2 mt-4">
                <span>© 2024 약-테크 (Yak-Tech). Beta Ver.</span>
                <div className="flex flex-col md:items-end">
                   <span className="font-semibold text-slate-300">Created by @acedoctor2026</span>
                   {dataDate ? (
                     <span className="text-slate-500 mt-0.5">Data: {dataDate} (v.{dataCount})</span>
                   ) : (
                     <span className="text-orange-500 mt-0.5">Need Sync (Github Actions)</span>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}