import { generateClient } from 'aws-amplify/api';
import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from 'react-icons/ai';
import { useProductionData } from '../hooks/useProductionData';

interface ProductionTableProps {
    selectedDate: Date;
}

const ProductionTable: React.FC<ProductionTableProps> = ({ selectedDate }) => {
    const [selectedProcess, setSelectedProcess] = useState('ラミネート');
    const { productionData, isLoading, error } = useProductionData(selectedDate, selectedProcess);
    const client = generateClient();
    // 状態として行数を管理
    const [rowCount, setRowCount] = useState(10);
    const [isSaving, setIsSaving] = useState(false);
    const [productNames, setProductNames] = useState<{ [key: number]: string }>({}); // 行ごとの製品名を管理
    const [orderNumbers, setOrderNumbers] = useState<{ [key: number]: string }>({}); // 受注番号用
    const [deadlines, setDeadlines] = useState<{ [key: number]: string }>({}); // 納期用の状態を追加
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [activeDeadlineRow, setActiveDeadlineRow] = useState<number | null>(null);
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
    const tableRef = useRef<HTMLDivElement>(null);
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
                if (!orderNumber) continue;

                const deadline = deadlines[rowNum];
                const productName = productNames[rowNum];

                if (!deadline) {
                    alert(`行 ${rowNum} の納期が入力されていません`);
                    return;
                }

                // 受注番号に選択された日付を付与
                const uniqueOrderNumber = `${orderNumber}-${dateStr}`;

                try {
                    // まず更新を試みる
                    const updateResult = await client.graphql({
                        query: `
                            mutation UpdateEchoProdManagement($input: UpdateEchoProdManagementInput!) {
                                updateEchoProdManagement(input: $input) {
                                    orderNumber
                                    processOptions
                                    deadline
                                    productName
                                }
                            }
                        `,
                        variables: {
                            input: {
                                orderNumber: uniqueOrderNumber,
                                processOptions: selectedProcess,
                                deadline: deadline,
                                productName: productName
                            }
                        }
                    });

                    console.log(`行 ${rowNum} の更新結果:`, updateResult);
                } catch (updateError) {
                    // 更新失敗時の新規作成処理
                    try {
                        const createResult = await client.graphql({
                            query: `
                                mutation CreateEchoProdManagement($input: CreateEchoProdManagementInput!) {
                                    createEchoProdManagement(input: $input) {
                                        orderNumber
                                        processOptions
                                        deadline
                                        productName
                                    }
                                }
                            `,
                            variables: {
                                input: {
                                    orderNumber: uniqueOrderNumber,
                                    processOptions: selectedProcess,
                                    deadline: deadline,
                                    productName: productName
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

    // 納期用の日付選択ハンドラ
    const handleDeadlineSelect = (date: Date, rowNum: number) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;

        setDeadlines(prev => ({
            ...prev,
            [rowNum]: dateStr
        }));
        setIsCalendarOpen(false);
        setActiveDeadlineRow(null);
    };

    // 日付選択用の簡易コンポーネントを作成
    const DatePicker: React.FC<{
        onDateSelect: (date: Date) => void;
        onClose: () => void;
    }> = ({ onDateSelect, onClose }) => {
        const [currentDate, setCurrentDate] = useState(() => {
            const today = new Date();
            return {
                year: today.getFullYear(),
                month: today.getMonth()
            };
        });

        const renderCalendar = () => {
            const firstDay = new Date(currentDate.year, currentDate.month, 1);
            const lastDay = new Date(currentDate.year, currentDate.month + 1, 0);
            const days = [];

            // 前月の日付を埋める
            for (let i = 0; i < firstDay.getDay(); i++) {
                days.push(
                    <div key={`empty-${i}`} className="text-center text-gray-400 p-1">
                        -
                    </div>
                );
            }

            // 当月の日付を埋める
            for (let date = 1; date <= lastDay.getDate(); date++) {
                days.push(
                    <div
                        key={date}
                        onClick={() => {
                            onDateSelect(new Date(currentDate.year, currentDate.month, date));
                            onClose();
                        }}
                        className="text-center p-1 cursor-pointer hover:bg-blue-100 rounded"
                    >
                        {date}
                    </div>
                );
            }

            return days;
        };

        return (
            <div className="bg-white shadow-lg rounded-lg p-2 w-64">
                <div className="flex justify-between items-center mb-2">
                    <button
                        onClick={() => setCurrentDate(prev => ({
                            ...prev,
                            month: prev.month - 1,
                            year: prev.month === 0 ? prev.year - 1 : prev.year
                        }))}
                        className="px-2 hover:bg-gray-100 rounded"
                    >
                        ←
                    </button>
                    <span>{currentDate.year}年{currentDate.month + 1}月</span>
                    <button
                        onClick={() => setCurrentDate(prev => ({
                            ...prev,
                            month: prev.month + 1,
                            year: prev.month === 11 ? prev.year + 1 : prev.year
                        }))}
                        className="px-2 hover:bg-gray-100 rounded"
                    >
                        →
                    </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-sm">
                    <div className="text-center text-red-500">日</div>
                    <div className="text-center">月</div>
                    <div className="text-center">火</div>
                    <div className="text-center">水</div>
                    <div className="text-center">木</div>
                    <div className="text-center">金</div>
                    <div className="text-center text-blue-500">土</div>
                    {renderCalendar()}
                </div>
            </div>
        );
    };

    // クリックイベントのハンドラーを追加
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
                setActiveDeadlineRow(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // テーブルセルのクリックハンドラー
    const handleCellClick = (event: React.MouseEvent<HTMLTableCellElement>, rowNum: number, isDeadlineCell: boolean) => {
        // 納期セル以外がクリックされた場合はカレンダーを閉じる
        if (!isDeadlineCell) {
            setIsCalendarOpen(false);
            setActiveDeadlineRow(null);
            return;
        }

        // 納期セルがクリックされた場合の処理
        const cell = event.currentTarget;
        const rect = cell.getBoundingClientRect();
        const tableRect = tableRef.current?.getBoundingClientRect();

        if (tableRect) {
            setCalendarPosition({
                top: rect.bottom - tableRect.top,
                left: rect.left - tableRect.left
            });
        }

        setIsCalendarOpen(true);
        setActiveDeadlineRow(rowNum);
    };

    // コンポーネントマウント時にデータを状態に設定
    useEffect(() => {
        if (!productionData?.length) return;
        console.log('設定するデータ:', productionData); // デバッグ用

        const newOrderNumbers: { [key: number]: string } = {};
        const newDeadlines: { [key: number]: string } = {};
        const newProductNames: { [key: number]: string } = {};

        productionData.forEach((item, index) => {
            const rowNum = index + 1;
            const orderNumber = item.orderNumber.split('-')[0]; // 日付部分を除去
            newOrderNumbers[rowNum] = orderNumber;
            newDeadlines[rowNum] = item.deadline;
            newProductNames[rowNum] = item.productName || '';
        });

        setOrderNumbers(newOrderNumbers);
        setDeadlines(newDeadlines);
        setProductNames(newProductNames);
        setSelectedProcess(productionData[0]?.processOptions || 'ラミネート');
    }, [productionData]);

    // プルダウンメニューの変更ハンドラを追加
    const handleProcessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProcess(e.target.value);
        // データをクリア
        setOrderNumbers({});
        setDeadlines({});
        setProductNames({});
    };

    // selectedDateが変更された時のクリーンアップ
    useEffect(() => {
        // データをクリア
        setOrderNumbers({});
        setDeadlines({});
        setProductNames({});
    }, [selectedDate]);  // selectedDateの変更を監視

    if (isLoading) {
        return <div className="p-4">データを読み込み中...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>;
    }

    return (
        <div ref={tableRef} className="relative">
            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th colSpan={3} className="border bg-gray-100 p-1 font-normal">
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
                                    setOrderNumbers(prev => ({
                                        ...prev,
                                        [rowNum]: e.currentTarget.textContent || ''
                                    }));
                                }}
                            >
                                {orderNumbers[rowNum]}
                            </td>
                            <td
                                className="border p-1"
                                contentEditable={true}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                    const content = e.currentTarget?.textContent;
                                    setProductNames(prev => ({
                                        ...prev,
                                        [rowNum]: content || ''
                                    }));
                                }}
                            >
                                {productNames[rowNum]}
                            </td>
                            {Array.from({ length: 10 }, (_, i) => (
                                <td
                                    key={i}
                                    className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                                    contentEditable={true}
                                    suppressContentEditableWarning={true}
                                    onClick={(e) => handleCellClick(e, rowNum, false)}
                                />
                            ))}
                            <td
                                className="border p-1 min-w-[60px] text-right hover:bg-blue-50 cursor-pointer"
                                onClick={(e) => handleCellClick(e, rowNum, true)}
                            >
                                {deadlines[rowNum] ? formatDate(deadlines[rowNum]) : ''}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* カレンダーコンポーネント */}
            {isCalendarOpen && activeDeadlineRow !== null && (
                <div
                    className="absolute z-50"
                    style={{
                        top: `${calendarPosition.top}px`,
                        left: `${calendarPosition.left - 200}px`
                    }}
                >
                    <DatePicker
                        onDateSelect={(date) => handleDeadlineSelect(date, activeDeadlineRow)}
                        onClose={() => {
                            setIsCalendarOpen(false);
                            setActiveDeadlineRow(null);
                        }}
                    />
                </div>
            )}

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

// 日付フォーマット用のヘルパー関数
const formatDate = (dateStr: string): string => {
    if (dateStr.length !== 8) return dateStr;
    return `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`;
};

export default ProductionTable;