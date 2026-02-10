import React from 'react';
import { Drug } from '../types';
import { ChevronRight } from 'lucide-react';

interface DrugListProps {
  currentDrug: Drug;
  alternatives: Drug[];
}

export const DrugList: React.FC<DrugListProps> = ({ currentDrug, alternatives }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
      <div className="p-6 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900">
          동일 성분 대체 가능 의약품 목록
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          주성분코드 <span className="font-mono bg-gray-200 px-1 rounded">{currentDrug.ingredientCode}</span> ({currentDrug.ingredientName})
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">약품명</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제약사</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">가격(1정)</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">절약액</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alternatives.map((drug) => {
              const isCurrent = drug.id === currentDrug.id;
              const saving = currentDrug.price - drug.price;
              
              return (
                <tr key={drug.id} className={isCurrent ? "bg-red-50" : "hover:bg-gray-50 transition-colors"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isCurrent && <span className="mr-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">현재복용</span>}
                      <div className={`text-sm font-medium ${isCurrent ? 'text-red-900' : 'text-gray-900'}`}>{drug.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {drug.manufacturer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                    {drug.price.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {isCurrent ? (
                      <span className="text-gray-400">-</span>
                    ) : saving > 0 ? (
                      <span className="text-blue-600 font-bold">+{saving.toLocaleString()}원 ▼</span>
                    ) : (
                      <span className="text-red-400 font-medium">{saving.toLocaleString()}원 ▲</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 border-t border-gray-100">
         상기 목록은 건강보험심사평가원 약제급여목록 기반 Mock Data입니다.
      </div>
    </div>
  );
};