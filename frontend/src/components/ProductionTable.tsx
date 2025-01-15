import { generateClient } from 'aws-amplify/api';
import React, { useState } from 'react';
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from 'react-icons/ai';

interface ProductionTableProps {
    selectedDate: Date;
}

const ProductionTable: React.FC<ProductionTableProps> = ({ selectedDate }) => {
    const client = generateClient();
    // 状態として行数を管理
    const [rowCount, setRowCount] = useState(10);
    const [isSaving, setIsSaving] = useState(false);
    // rowCountを使用して動的に行を生成
    const rows = Array.from({ length: rowCount }, (_, i) => i + 1);
    const processOptions = [
        'ラミネート',
        '1Ｆ プレス',
        '1号機',
        '2号機',
        '3号機',
        'スーパーカッター',
        'ドビープレス',
        'キスカットプレス',
        'スリット'
    ];

    const addRow = () => setRowCount(prev => prev + 1);
    const removeRow = () => setRowCount(prev => Math.max(1, prev - 1));

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // 現在の日付をyyyymmdd形式で取得
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');

            const uniqueOrderNumber = `ORDER-${year}${month}${day}`;

            const result = await client.graphql({
                query: `
                    mutation CreateEchoProdManagement($input: CreateEchoProdManagementInput!) {
                        createEchoProdManagement(input: $input) {
                            orderNumber
                            deadline
                            processOptions
                        }
                    }
                `,
                variables: {
                    input: {
                        orderNumber: uniqueOrderNumber,
                        deadline: "20250303",
                        processOptions: "ラミネート"
                    }
                }
            });
            console.log('保存結果:', result);
            alert('保存しました');
        } catch (error: any) {
            console.error('保存エラー詳細:', error);
            alert('保存に失敗しました');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th colSpan={3} className="border bg-gray-100 p-1 font-normal">
                            <select className="w-full bg-transparent font-bold text-blue-600" defaultValue="ラミネート">
                                {processOptions.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </th>
                        <th rowSpan={2} className="border bg-gray-100 p-1 font-normal">受注数</th>
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
                <tbody>
                    {rows.map(rowNum => (
                        <tr key={rowNum}>
                            <td className="border bg-gray-100 p-1 font-bold text-center relative">
                                {rowNum === rowCount && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-1 -ml-10">
                                        <AiOutlinePlusCircle
                                            className="text-blue-600 cursor-pointer hover:text-blue-800"
                                            onClick={addRow}
                                        />
                                        <AiOutlineMinusCircle
                                            className="text-red-600 cursor-pointer hover:text-red-800"
                                            onClick={removeRow}
                                        />
                                    </div>
                                )}
                                {rowNum}
                            </td>
                            {Array.from({ length: 14 }, (_, i) => (
                                <td
                                    key={i}
                                    className={`border p-1 min-w-[60px] ${i === 1 ? 'text-left' : 'text-right'} hover:bg-blue-50`}
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="mt-4 flex justify-start">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isSaving ? '保存中...' : '保存'}
                </button>
            </div>
        </div>
    );
}

export default ProductionTable;