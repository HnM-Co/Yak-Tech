import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AlertTriangle, TrendingDown, Car, Coffee, Info } from 'lucide-react';
import { DrugComparison } from '../types';
import { PILLS_PER_DAY_DEFAULT } from '../constants';

interface LossDashboardProps {
  comparison: DrugComparison;
}

export const LossDashboard: React.FC<LossDashboardProps> = ({ comparison }) => {
  const { original, cheapest, savingsPerPill, alternatives } = comparison;
  
  // API로 검색된 약품 등 대체약 데이터가 충분하지 않은 경우
  if (alternatives.length <= 1) {
     return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="inline-flex items-center justify-center p-3 bg-gray-200 rounded-full mb-4">
          <Info className="h-8 w-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">비교 분석 데이터 부족</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          선택하신 <strong>{original.name}</strong>의 정확한 약가 비교 정보가 아직 업데이트되지 않았습니다.<br/>
          (Mock 데이터에 포함된 타이레놀, 쎄레브렉스 등으로 테스트해보세요)
        </p>
      </div>
     );
  }

  if (savingsPerPill <= 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center shadow-sm">
        <div className="inline-flex items-center justify-center p-3 bg-green-100 rounded-full mb-4">
          <TrendingDown className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-800 mb-2">탁월한 선택입니다!</h2>
        <p className="text-green-700">현재 가장 경제적인 약을 복용하고 계십니다.</p>
        <div className="mt-4 p-4 bg-white rounded-xl inline-block shadow-sm">
           <span className="text-gray-500 text-sm">현재 약가</span>
           <div className="text-3xl font-bold text-green-600">{original.price.toLocaleString()}원</div>
        </div>
      </div>
    );
  }

  const yearlySavings = savingsPerPill * PILLS_PER_DAY_DEFAULT * 365;
  const decadeSavings = yearlySavings * 10;
  
  const chartData = [
    { name: '현재 처방약', price: original.price, color: '#ef4444' }, // Red for expensive
    { name: '최저가 대체약', price: cheapest.price, color: '#3b82f6' }, // Blue for cheap
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Warning Section */}
      <div className="bg-white border-l-8 border-red-500 rounded-2xl shadow-lg p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <AlertTriangle className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-red-600 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider uppercase">손실 경고 (Loss Alert)</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            지금 약을 바꾸지 않으면<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600">
              10년 동안 {Math.floor(decadeSavings / 10000).toLocaleString()}만원
            </span>을 잃게 됩니다.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-red-50 rounded-xl p-6 border border-red-100 transform hover:scale-105 transition duration-300">
              <p className="text-red-600 font-medium mb-1">1년 손실금액</p>
              <p className="text-3xl font-bold text-red-700">{yearlySavings.toLocaleString()} 원</p>
              <div className="mt-3 flex items-center text-sm text-red-500 space-x-2">
                <Coffee className="w-4 h-4" />
                <span>매년 최고급 호텔 뷔페 {(yearlySavings / 150000).toFixed(1)}회 식사값</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 transform hover:scale-105 transition duration-300">
              <p className="text-slate-600 font-medium mb-1">10년 손실금액</p>
              <p className="text-3xl font-bold text-slate-800">{decadeSavings.toLocaleString()} 원</p>
              <div className="mt-3 flex items-center text-sm text-slate-500 space-x-2">
                <Car className="w-4 h-4" />
                <span>중고 경차 한 대 값과 맞먹습니다</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
          <span className="w-1 h-6 bg-medical-500 mr-2 rounded-full"></span>
          1알 당 가격 비교
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
              <XAxis type="number" unit="원" />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tick={{fill: '#475569', fontSize: 14, fontWeight: 500}} 
              />
              <Tooltip 
                cursor={{fill: 'transparent'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="price" barSize={40} radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          * {original.name} ({original.price}원) vs {cheapest.name} ({cheapest.price}원)
        </div>
      </div>

      {/* Action Item */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h4 className="text-lg font-bold text-blue-900">어떻게 하면 되나요?</h4>
          <p className="text-blue-700 text-sm mt-1">다음 진료 시 의사 선생님께 아래 화면을 보여주세요.</p>
        </div>
        <div className="px-6 py-3 bg-white text-blue-600 font-bold rounded-lg border border-blue-200 shadow-sm">
          "{cheapest.name}(으)로 변경 가능할까요?"
        </div>
      </div>
    </div>
  );
};