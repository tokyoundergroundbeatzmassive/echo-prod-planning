import { generateClient } from 'aws-amplify/api';
import React, { useEffect, useRef, useState } from 'react';
import { useProductionData } from '../../hooks/useProductionData';
import { DatePicker } from './DatePicker';
import { ProductionTableBody } from './ProductionTableBody';
import { ProductionTableHeader } from './ProductionTableHeader';

interface ProductionTableProps {
    selectedDate: Date;
}

const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
};

const ProductionTable: React.FC<ProductionTableProps> = ({ selectedDate }) => {
    const [selectedProcess, setSelectedProcess] = useState('ラミネート');
    const { productionData, isLoading, error } = useProductionData(selectedDate, selectedProcess);
    const client = generateClient();

    // 状態管理
    const [rowCount, setRowCount] = useState(10);
    const [isSaving, setIsSaving] = useState(false);
    const [productNames, setProductNames] = useState<{ [key: number]: string }>({});
    const [orderNumbers, setOrderNumbers] = useState<{ [key: number]: string }>({});
    const [deadlines, setDeadlines] = useState<{ [key: number]: string }>({});
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [activeDeadlineRow, setActiveDeadlineRow] = useState<number | null>(null);
    const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });
    const tableRef = useRef<HTMLDivElement>(null);
    const [orderQuantities, setOrderQuantities] = useState<{ [key: number]: number }>({});
    const [processPlanQuantities, setProcessPlanQuantities] = useState<{ [key: number]: number }>({});
    const [processPlanTimes, setProcessPlanTimes] = useState<{ [key: number]: number }>({});
    const [processResultQuantities, setProcessResultQuantities] = useState<{ [key: number]: number }>({});

    // 工程オプション
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

    const rows = Array.from({ length: rowCount }, (_, i) => i + 1);
    const addRow = () => setRowCount(prev => prev + 1);
    const removeRow = () => setRowCount(prev => Math.max(1, prev - 1));

    const handleProcessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProcess(e.target.value);
    };

    const handleCellClick = (event: React.MouseEvent<HTMLTableCellElement>, rowNum: number, isDeadlineCell: boolean) => {
        if (!isDeadlineCell) {
            setIsCalendarOpen(false);
            setActiveDeadlineRow(null);
            return;
        }

        const cell = event.currentTarget;
        const rect = cell.getBoundingClientRect();
        const scrollY = window.scrollY || window.pageYOffset;

        setCalendarPosition({
            top: rect.top + rect.height + scrollY,
            left: rect.left
        });

        setIsCalendarOpen(true);
        setActiveDeadlineRow(rowNum);
    };

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

    // 保存処理
    const handleSave = async () => {
        try {
            setIsSaving(true);
            const dateStr = formatDateToString(selectedDate);

            for (const rowNum of Object.keys(orderNumbers)) {
                const result = await saveRowData(rowNum, dateStr);
                if (!result) return;
            }

            alert('処理が完了しました');
        } catch (error: any) {
            console.error('全体的なエラー:', error);
            alert('処理中にエラーが発生しました');
        } finally {
            setIsSaving(false);
        }
    };

    // データ初期化
    useEffect(() => {
        if (!productionData?.length) return;

        const newOrderNumbers: { [key: number]: string } = {};
        const newDeadlines: { [key: number]: string } = {};
        const newProductNames: { [key: number]: string } = {};
        const newOrderQuantities: { [key: number]: number } = {};
        const newProcessPlanQuantities: { [key: number]: number } = {};
        const newProcessPlanTimes: { [key: number]: number } = {};
        const newProcessResultQuantities: { [key: number]: number } = {};

        productionData.forEach((item, index) => {
            const rowNum = index + 1;
            const orderNumber = item.orderNumber.split('-')[0];
            newOrderNumbers[rowNum] = orderNumber;
            newDeadlines[rowNum] = item.deadline;
            newProductNames[rowNum] = item.productName || '';
            newOrderQuantities[rowNum] = parseInt(item.orderQuantity, 10) || 0;
            newProcessPlanQuantities[rowNum] = Number(item.processPlanQuantity) || 0;
            newProcessPlanTimes[rowNum] = Number(item.processPlanTime) || 0;
            newProcessResultQuantities[rowNum] = Number(item.processResultQuantity) || 0;
        });

        setOrderNumbers(newOrderNumbers);
        setDeadlines(newDeadlines);
        setProductNames(newProductNames);
        setOrderQuantities(newOrderQuantities);
        setProcessPlanQuantities(newProcessPlanQuantities);
        setProcessPlanTimes(newProcessPlanTimes);
        setProcessResultQuantities(newProcessResultQuantities);
        setSelectedProcess(productionData[0]?.processOptions || 'ラミネート');
    }, [productionData]);

    // 日付変更時のクリーンアップ
    useEffect(() => {
        setOrderNumbers({});
        setDeadlines({});
        setProductNames({});
        setOrderQuantities({});
        setProcessPlanQuantities({});
        setProcessPlanTimes({});
        setProcessResultQuantities({});
    }, [selectedDate]);

    const saveRowData = async (rowNum: string, dateStr: string) => {
        const orderNumber = orderNumbers[rowNum];
        if (!orderNumber) return false;

        const deadline = deadlines[rowNum];
        if (!deadline) {
            alert(`行 ${rowNum} の納期が入力されていません`);
            return false;
        }

        const productName = productNames[rowNum];
        const orderQuantity = orderQuantities[rowNum];
        const processPlanQuantity = processPlanQuantities[rowNum];
        const processPlanTime = processPlanTimes[rowNum];
        const processResultQuantity = processResultQuantities[rowNum];

        const uniqueOrderNumber = `${orderNumber}-${dateStr}`;

        try {
            await client.graphql({
                query: `
                    mutation UpdateEchoProdManagement($input: UpdateEchoProdManagementInput!) {
                        updateEchoProdManagement(input: $input) {
                            orderNumber
                            processOptions
                            deadline
                            productName
                            orderQuantity
                            processPlanQuantity
                            processPlanTime
                            processResultQuantity
                        }
                    }
                `,
                variables: {
                    input: {
                        orderNumber: uniqueOrderNumber,
                        processOptions: selectedProcess,
                        deadline: deadline,
                        productName: productName,
                        orderQuantity: orderQuantity,
                        processPlanQuantity: processPlanQuantity,
                        processPlanTime: processPlanTime,
                        processResultQuantity: processResultQuantity
                    }
                }
            });
        } catch (error) {
            await client.graphql({
                query: `
                    mutation CreateEchoProdManagement($input: CreateEchoProdManagementInput!) {
                        createEchoProdManagement(input: $input) {
                            orderNumber
                            processOptions
                            deadline
                            productName
                            orderQuantity
                            processPlanQuantity
                            processPlanTime
                            processResultQuantity
                        }
                    }
                `,
                variables: {
                    input: {
                        orderNumber: uniqueOrderNumber,
                        processOptions: selectedProcess,
                        deadline: deadline,
                        productName: productName,
                        orderQuantity: orderQuantity,
                        processPlanQuantity: processPlanQuantity,
                        processPlanTime: processPlanTime,
                        processResultQuantity: processResultQuantity
                    }
                }
            });
        }
        return true;
    };

    if (isLoading) return <div className="p-4">データを読み込み中...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div ref={tableRef} className="relative">
            <table className="w-full border-collapse text-sm">
                <ProductionTableHeader
                    selectedProcess={selectedProcess}
                    handleProcessChange={handleProcessChange}
                    processOptions={processOptions}
                />
                <ProductionTableBody
                    rows={rows}
                    rowCount={rowCount}
                    orderNumbers={orderNumbers}
                    productNames={productNames}
                    deadlines={deadlines}
                    orderQuantities={orderQuantities}
                    processPlanQuantities={processPlanQuantities}
                    processPlanTimes={processPlanTimes}
                    processResultQuantities={processResultQuantities}
                    setOrderNumbers={setOrderNumbers}
                    setProductNames={setProductNames}
                    setOrderQuantities={setOrderQuantities}
                    setProcessPlanQuantities={setProcessPlanQuantities}
                    setProcessPlanTimes={setProcessPlanTimes}
                    setProcessResultQuantities={setProcessResultQuantities}
                    handleCellClick={handleCellClick}
                    addRow={addRow}
                    removeRow={removeRow}
                />
            </table>

            {isCalendarOpen && activeDeadlineRow !== null && (
                <DatePicker
                    position={calendarPosition}
                    onDateSelect={(date) => handleDeadlineSelect(date, activeDeadlineRow)}
                    onClose={() => {
                        setIsCalendarOpen(false);
                        setActiveDeadlineRow(null);
                    }}
                />
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
};

export default ProductionTable; 