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
    const [productNames, setProductNames] = useState<{ [key: number]: string }>({}); // 行ごとの製品名を管理
    const [orderNumbers, setOrderNumbers] = useState<{ [key: number]: string }>({}); // 受注番号用
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

            // 選択された日付をyyyymmdd形式で取得
            const date = selectedDate;
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}${month}${day}`;

            // 全ての行のデータを保存
            for (const rowNum of Object.keys(orderNumbers)) {
                const orderNumber = orderNumbers[rowNum];
                if (!orderNumber) continue; // 空の行はスキップ

                // 受注番号に選択された日付を付与
                const uniqueOrderNumber = `${orderNumber}-${dateStr}`;

                try {
                    // まず更新を試みる
                    const updateResult = await client.graphql({
                        query: `
                            mutation UpdateEchoProdManagement($input: UpdateEchoProdManagementInput!) {
                                updateEchoProdManagement(input: $input) {
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
                                processOptions: "スーパーカッター"
                            }
                        }
                    });

                    console.log(`行 ${rowNum} の更新結果:`, updateResult);
                } catch (updateError) {
                    console.log('更新に失敗、新規作成を試みます:', updateError);

                    try {
                        // 更新に失敗した場合は新規作成を試みる
                        const createResult = await client.graphql({
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
                                    processOptions: "スーパーカッター"
                                }
                            }
                        });

                        console.log(`行 ${rowNum} の新規作成結果:`, createResult);
                    } catch (createError) {
                        console.error(`行 ${rowNum} の保存に失敗:`, createError);
                        alert(`行 ${rowNum} の保存に失敗しました: ${createError.message}`);
                    }
                }
            }

            alert('処理が完了しました');
        } catch (error: any) {
            console.error('全体的なエラー:', error);
            alert('処理中にエラーが発生しました');
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
                            <td
                                className="border p-1"
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                    const newValue = e.currentTarget.textContent || '';
                                    setOrderNumbers(prev => ({
                                        ...prev,
                                        [rowNum]: newValue
                                    }));
                                    console.log('受注番号が更新されました:', rowNum, newValue);
                                }}
                            />
                            <td
                                className="border p-1"
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                    const newValue = e.currentTarget.textContent || '';
                                    setProductNames(prev => ({
                                        ...prev,
                                        [rowNum]: newValue
                                    }));
                                    console.log('製品名が更新されました:', rowNum, newValue);
                                }}
                            />
                            {Array.from({ length: 11 }, (_, i) => (
                                <td
                                    key={i}
                                    className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
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