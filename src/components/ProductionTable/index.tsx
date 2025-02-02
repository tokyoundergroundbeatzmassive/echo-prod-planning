import { generateClient } from 'aws-amplify/api';
import React, { useEffect, useRef, useState } from 'react';
import { formatDateToString } from '../../utils/dateUtils';
import { DatePicker } from './DatePicker';
import { useProductionData } from './hooks/useProductionData';
import { saveDetailData } from './mutation/saveIndividual';
import { saveRowData } from './mutation/saveRowData';
import { ProductionTableBody } from './ProductionTableBody';
import { ProductionTableHeader } from './ProductionTableHeader';

interface ProductionTableProps {
    selectedDate: Date;
    initialProcess?: string;
}

const ProductionTable: React.FC<ProductionTableProps> = ({ selectedDate, initialProcess }) => {
    const [selectedProcess, setSelectedProcess] = useState(initialProcess || 'ラミネート');
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
    const [orderQuantities, setOrderQuantities] = useState<{ [key: number]: number | null }>({});
    const [processPlanQuantities, setProcessPlanQuantities] = useState<{ [key: number]: number | null }>({});
    const [processPlanTimes, setProcessPlanTimes] = useState<{ [key: number]: number | null }>({});
    const [processResultQuantities, setProcessResultQuantities] = useState<{ [key: number]: number | null }>({});
    const [processResultTimes, setProcessResultTimes] = useState<{ [key: number]: number | null }>({});
    const [inspectionPlanQuantities, setInspectionPlanQuantities] = useState<{ [key: number]: number | null }>({});
    const [inspectionPlanTimes, setInspectionPlanTimes] = useState<{ [key: number]: number | null }>({});
    const [inspectionResultQuantities, setInspectionResultQuantities] = useState<{ [key: number]: number | null }>({});
    const [inspectionResultTimes, setInspectionResultTimes] = useState<{ [key: number]: number | null }>({});
    const [boxCounts, setBoxCounts] = useState<{ [key: number]: number | null }>({});

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
        setOrderNumbers({});
        setDeadlines({});
        setProductNames({});
        setOrderQuantities({});
        setProcessPlanQuantities({});
        setProcessPlanTimes({});
        setProcessResultQuantities({});
        setProcessResultTimes({});
        setInspectionPlanQuantities({});
        setInspectionPlanTimes({});
        setInspectionResultQuantities({});
        setInspectionResultTimes({});
        setBoxCounts({});
    };

    const handleCellClick = (event: React.MouseEvent<HTMLTableCellElement>, rowNum: number, isDeadlineCell: boolean) => {
        if (!isDeadlineCell) {
            setIsCalendarOpen(false);
            setActiveDeadlineRow(null);
            return;
        }

        const cell = event.currentTarget;
        const rect = cell.getBoundingClientRect();
        const scrollY = window.scrollY;

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
                // 基本データの保存（納期までの一括登録）
                const result = await saveRowData({
                    rowNum,
                    currentDateStr: dateStr,
                    orderNumbers,
                    deadlines,
                    productNames,
                    orderQuantities,
                    selectedProcess
                });
                if (!result) return;

                // 詳細データの保存（現在の日付のみ）
                const detailResult = await saveDetailData({
                    rowNum,
                    currentDateStr: dateStr,
                    orderNumbers,
                    selectedProcess,
                    orderQuantities,
                    processPlanQuantities,
                    processPlanTimes,
                    processResultQuantities,
                    processResultTimes,
                    inspectionPlanQuantities,
                    inspectionPlanTimes,
                    inspectionResultQuantities,
                    inspectionResultTimes,
                    boxCounts
                });

                if (!detailResult) return;
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
        const newOrderQuantities: { [key: number]: number | null } = {};
        const newProcessPlanQuantities: { [key: number]: number | null } = {};
        const newProcessPlanTimes: { [key: number]: number | null } = {};
        const newProcessResultQuantities: { [key: number]: number | null } = {};
        const newProcessResultTimes: { [key: number]: number | null } = {};
        const newInspectionPlanQuantities: { [key: number]: number | null } = {};
        const newInspectionPlanTimes: { [key: number]: number | null } = {};
        const newInspectionResultQuantities: { [key: number]: number | null } = {};
        const newInspectionResultTimes: { [key: number]: number | null } = {};
        const newBoxCounts: { [key: number]: number | null } = {};

        productionData.forEach((item, index) => {
            const rowNum = index + 1;
            const orderNumber = item.orderNumber.split('-')[0];
            newOrderNumbers[rowNum] = orderNumber;
            newDeadlines[rowNum] = item.deadline;
            newProductNames[rowNum] = item.productName || '';
            newOrderQuantities[rowNum] = Number(item.orderQuantity) || null;
            newProcessPlanQuantities[rowNum] = Number(item.processPlanQuantity) || null;
            newProcessPlanTimes[rowNum] = Number(item.processPlanTime) || null;
            newProcessResultQuantities[rowNum] = Number(item.processResultQuantity) || null;
            newProcessResultTimes[rowNum] = Number(item.processResultTime) || null;
            newInspectionPlanQuantities[rowNum] = Number(item.inspectionPlanQuantity) || null;
            newInspectionPlanTimes[rowNum] = Number(item.inspectionPlanTime) || null;
            newInspectionResultQuantities[rowNum] = Number(item.inspectionResultQuantity) || null;
            newInspectionResultTimes[rowNum] = Number(item.inspectionResultTime) || null;
            newBoxCounts[rowNum] = Number(item.boxCount) || null;
        });

        setOrderNumbers(newOrderNumbers);
        setDeadlines(newDeadlines);
        setProductNames(newProductNames);
        setOrderQuantities(newOrderQuantities);
        setProcessPlanQuantities(newProcessPlanQuantities);
        setProcessPlanTimes(newProcessPlanTimes);
        setProcessResultQuantities(newProcessResultQuantities);
        setProcessResultTimes(newProcessResultTimes);
        setInspectionPlanQuantities(newInspectionPlanQuantities);
        setInspectionPlanTimes(newInspectionPlanTimes);
        setInspectionResultQuantities(newInspectionResultQuantities);
        setInspectionResultTimes(newInspectionResultTimes);
        setBoxCounts(newBoxCounts);
        setSelectedProcess(productionData[0]?.processOptions || 'ラミネート');
    }, [productionData]);

    useEffect(() => {
        if (initialProcess) {
            setSelectedProcess(initialProcess);
        }
    }, [initialProcess]);

    // 日付変更時のクリーンアップ
    useEffect(() => {
        setOrderNumbers({});
        setDeadlines({});
        setProductNames({});
        setOrderQuantities({});
        setProcessPlanQuantities({});
        setProcessPlanTimes({});
        setProcessResultQuantities({});
        setProcessResultTimes({});
        setInspectionPlanQuantities({});
        setInspectionPlanTimes({});
        setInspectionResultQuantities({});
        setInspectionResultTimes({});
        setBoxCounts({});
    }, [selectedDate]);

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
                    processResultTimes={processResultTimes}
                    inspectionPlanQuantities={inspectionPlanQuantities}
                    inspectionPlanTimes={inspectionPlanTimes}
                    inspectionResultQuantities={inspectionResultQuantities}
                    inspectionResultTimes={inspectionResultTimes}
                    boxCounts={boxCounts}
                    setOrderNumbers={setOrderNumbers}
                    setProductNames={setProductNames}
                    setOrderQuantities={setOrderQuantities}
                    setProcessPlanQuantities={setProcessPlanQuantities}
                    setProcessPlanTimes={setProcessPlanTimes}
                    setProcessResultQuantities={setProcessResultQuantities}
                    setProcessResultTimes={setProcessResultTimes}
                    setInspectionPlanQuantities={setInspectionPlanQuantities}
                    setInspectionPlanTimes={setInspectionPlanTimes}
                    setInspectionResultQuantities={setInspectionResultQuantities}
                    setInspectionResultTimes={setInspectionResultTimes}
                    setBoxCounts={setBoxCounts}
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