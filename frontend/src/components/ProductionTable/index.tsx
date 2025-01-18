import { generateClient } from 'aws-amplify/api';
import React, { useEffect, useRef, useState } from 'react';
import { useProductionData } from '../../hooks/useProductionData';
import { formatDateToString, generateDateRange, parseStringToDate } from '../../utils/dateUtils';
import { DatePicker } from './DatePicker';
import { ProductionTableBody } from './ProductionTableBody';
import { ProductionTableHeader } from './ProductionTableHeader';

interface ProductionTableProps {
    selectedDate: Date;
}

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
                // 基本データの保存（納期までの一括登録）
                const result = await saveRowData(rowNum, dateStr);
                if (!result) return;

                // 詳細データの保存（現在の日付のみ）
                const detailResult = await saveDetailData(rowNum, dateStr);
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
            newOrderQuantities[rowNum] = parseInt(item.orderQuantity, 10) || null;
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

    const saveRowData = async (rowNum: string, currentDateStr: string) => {
        const orderNumber = orderNumbers[rowNum];
        if (!orderNumber) return false;

        const deadline = deadlines[rowNum];
        if (!deadline) {
            alert(`行 ${rowNum} の納期が入力されていません`);
            return false;
        }

        const productName = productNames[rowNum];
        const orderQuantity = orderQuantities[rowNum];

        // 開始日と終了日をDate型に変換
        const startDate = parseStringToDate(currentDateStr);
        const endDate = parseStringToDate(deadline);
        // 日付の範囲を生成
        const dateRange = generateDateRange(startDate, endDate);

        try {
            // 各日付に対してレコードを作成または更新
            for (const date of dateRange) {
                const dateStr = formatDateToString(date);
                const uniqueOrderNumber = `${orderNumber}-${dateStr}`;

                const baseInput = {
                    orderNumber: uniqueOrderNumber,
                    processOptions: selectedProcess,
                    deadline: deadline,
                    productName: productName || '',  // 空文字列の場合はそのまま空文字列を保存
                    orderQuantity: orderQuantity || null  // 値がない場合はnullを設定
                };

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
                                }
                            }
                        `,
                        variables: { input: baseInput }
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
                                }
                            }
                        `,
                        variables: { input: baseInput }
                    });
                }
            }
            return true;
        } catch (error) {
            console.error('保存エラー:', error);
            alert('データの保存中にエラーが発生しました');
            return false;
        }
    };

    // 個別データ更新用の関数
    const saveDetailData = async (rowNum: string, currentDateStr: string) => {
        const orderNumber = orderNumbers[rowNum];
        if (!orderNumber) return false;

        const uniqueOrderNumber = `${orderNumber}-${currentDateStr}`;

        const detailInput = {
            orderNumber: uniqueOrderNumber,
            processOptions: selectedProcess,
            processPlanQuantity: processPlanQuantities[rowNum] || null,
            processPlanTime: processPlanTimes[rowNum] || null,
            processResultQuantity: processResultQuantities[rowNum] || null,
            processResultTime: processResultTimes[rowNum] || null,
            inspectionPlanQuantity: inspectionPlanQuantities[rowNum] || null,
            inspectionPlanTime: inspectionPlanTimes[rowNum] || null,
            inspectionResultQuantity: inspectionResultQuantities[rowNum] || null,
            inspectionResultTime: inspectionResultTimes[rowNum] || null,
            boxCount: boxCounts[rowNum] || null
        };

        try {
            await client.graphql({
                query: `
                    mutation UpdateEchoProdManagement($input: UpdateEchoProdManagementInput!) {
                        updateEchoProdManagement(input: $input) {
                            orderNumber
                            processOptions
                            processPlanQuantity
                            processPlanTime
                            processResultQuantity
                            processResultTime
                            inspectionPlanQuantity
                            inspectionPlanTime
                            inspectionResultQuantity
                            inspectionResultTime
                            boxCount
                        }
                    }
                `,
                variables: { input: detailInput }
            });
            return true;
        } catch (error) {
            console.error('詳細データの保存エラー:', error);
            alert('詳細データの保存中にエラーが発生しました');
            return false;
        }
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