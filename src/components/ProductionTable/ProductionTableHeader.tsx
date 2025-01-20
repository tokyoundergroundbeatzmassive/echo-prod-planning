import React from 'react';

interface ProductionTableHeaderProps {
    selectedProcess: string;
    handleProcessChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    processOptions: string[];
}

export const ProductionTableHeader: React.FC<ProductionTableHeaderProps> = ({
    selectedProcess,
    handleProcessChange,
    processOptions
}) => {
    return (
        <thead>
            <tr>
                <th colSpan={4} className="border bg-gray-100 p-1 font-normal">
                    <select
                        className="w-full bg-transparent font-bold text-blue-600"
                        value={selectedProcess}
                        onChange={handleProcessChange}
                    >
                        {processOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                        ))}
                    </select>
                </th>
                <th colSpan={2} className="border bg-gray-100 p-1 font-normal">加工計画</th>
                <th colSpan={2} className="border bg-gray-100 p-1 font-normal">加工実績</th>
                <th colSpan={2} className="border bg-gray-100 p-1 font-normal">検査計画</th>
                <th colSpan={2} className="border bg-gray-100 p-1 font-normal">検査実績</th>
                <th rowSpan={2} className="border bg-gray-100 p-1 font-normal">箱数</th>
                <th rowSpan={2} className="border bg-gray-100 p-1 font-normal">納期</th>
            </tr>
            <tr>
                <th className="border bg-gray-100 p-1 font-normal">No.</th>
                <th className="border bg-gray-100 p-1 font-normal">受注番号</th>
                <th className="border bg-gray-100 p-1 font-normal">製品名</th>
                <th className="border bg-gray-100 p-1 font-normal">受注数</th>
                <th className="border bg-gray-100 p-1 font-normal">数量</th>
                <th className="border bg-gray-100 p-1 font-normal">工数</th>
                <th className="border bg-gray-100 p-1 font-normal">実績</th>
                <th className="border bg-gray-100 p-1 font-normal">工数</th>
                <th className="border bg-gray-100 p-1 font-normal">数量</th>
                <th className="border bg-gray-100 p-1 font-normal">工数</th>
                <th className="border bg-gray-100 p-1 font-normal">実績</th>
                <th className="border bg-gray-100 p-1 font-normal">工数</th>
            </tr>
        </thead>
    );
}; 