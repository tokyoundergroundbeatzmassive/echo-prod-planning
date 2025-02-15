import React from 'react';
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from 'react-icons/ai';
import { formatDate } from '../../utils/formatDate';
import { deleteProductionRecords } from './mutations/deleteProductionRecords';

interface ProductionTableBodyProps {
    rows: number[];
    rowCount: number;
    orderNumbers: { [key: number]: string };
    productNames: { [key: number]: string };
    deadlines: { [key: number]: string };
    orderQuantities: { [key: number]: number };
    processPlanQuantities: { [key: number]: number };
    processPlanTimes: { [key: number]: number };
    processResultQuantities: { [key: number]: number };
    processResultTimes: { [key: number]: number };
    inspectionPlanQuantities: { [key: number]: number };
    inspectionPlanTimes: { [key: number]: number };
    inspectionResultQuantities: { [key: number]: number };
    inspectionResultTimes: { [key: number]: number };
    boxCounts: { [key: number]: number };
    selectedProcess: string;
    setOrderNumbers: (value: React.SetStateAction<{ [key: number]: string }>) => void;
    setProductNames: (value: React.SetStateAction<{ [key: number]: string }>) => void;
    handleCellClick: (event: React.MouseEvent<HTMLTableCellElement>, rowNum: number, isDeadlineCell: boolean) => void;
    addRow: () => void;
    removeRow: () => void;
    setOrderQuantities: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    setProcessPlanQuantities: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    setProcessPlanTimes: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    setProcessResultQuantities: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    setProcessResultTimes: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    setInspectionPlanQuantities: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    setInspectionPlanTimes: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    setInspectionResultQuantities: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    setInspectionResultTimes: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    setBoxCounts: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    onDataDeleted?: () => Promise<void>;
}

export const ProductionTableBody: React.FC<ProductionTableBodyProps> = ({
    rows,
    rowCount,
    orderNumbers,
    productNames,
    deadlines,
    orderQuantities,
    processPlanQuantities,
    processPlanTimes,
    processResultQuantities,
    processResultTimes,
    inspectionPlanQuantities,
    inspectionPlanTimes,
    inspectionResultQuantities,
    inspectionResultTimes,
    boxCounts,
    selectedProcess,
    setOrderNumbers,
    setProductNames,
    handleCellClick,
    addRow,
    removeRow,
    setOrderQuantities,
    setProcessPlanQuantities,
    setProcessPlanTimes,
    setProcessResultQuantities,
    setProcessResultTimes,
    setInspectionPlanQuantities,
    setInspectionPlanTimes,
    setInspectionResultQuantities,
    setInspectionResultTimes,
    setBoxCounts,
    onDataDeleted
}) => {
    return (
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
                        {orderNumbers[rowNum] && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 flex gap-1 -ml-5">
                                <AiOutlineMinusCircle
                                    className="text-red-600 cursor-pointer hover:text-red-800"
                                    onClick={async () => {
                                        if (window.confirm('このレコードを削除してもよろしいですか？')) {
                                            const baseOrderNumber = orderNumbers[rowNum].split('-')[0];
                                            const result = await deleteProductionRecords(baseOrderNumber, selectedProcess);
                                            if (result && onDataDeleted) {
                                                await onDataDeleted();
                                            }
                                        }
                                    }}
                                    title="このレコードを削除"
                                />
                            </div>
                        )}
                        {rowNum}
                    </td>
                    <td
                        className={`border p-1 ${orderNumbers[rowNum] ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : 'hover:bg-blue-50'}`}
                        contentEditable={!orderNumbers[rowNum]}
                        suppressContentEditableWarning={true}
                        title={orderNumbers[rowNum] ? "注文番号は一度入力すると編集できません" : ""}
                        onBlur={(e) => {
                            if (orderNumbers[rowNum]) return; // 既存の値がある場合は更新しない
                            const content = e.currentTarget?.textContent ?? '';
                            setOrderNumbers(prev => ({
                                ...prev,
                                [rowNum]: content
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
                            const content = e.currentTarget?.textContent ?? '';
                            setProductNames(prev => ({
                                ...prev,
                                [rowNum]: content
                            }));
                        }}
                    >
                        {productNames[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = content.trim() === '' ? null : parseInt(content, 10);
                            setOrderQuantities(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {orderQuantities[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = content.trim() === '' ? null : parseInt(content, 10);
                            setProcessPlanQuantities(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {processPlanQuantities[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = content.trim() === '' ? null : parseFloat(content);
                            setProcessPlanTimes(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {processPlanTimes[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = content.trim() === '' ? null : parseInt(content, 10);
                            setProcessResultQuantities(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {processResultQuantities[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = content.trim() === '' ? null : parseFloat(content);
                            setProcessResultTimes(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {processResultTimes[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = content.trim() === '' ? null : parseInt(content, 10);
                            setInspectionPlanQuantities(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {inspectionPlanQuantities[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = content.trim() === '' ? null : parseFloat(content);
                            setInspectionPlanTimes(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {inspectionPlanTimes[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = content.trim() === '' ? null : parseInt(content, 10);
                            setInspectionResultQuantities(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {inspectionResultQuantities[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = content.trim() === '' ? null : parseFloat(content);
                            setInspectionResultTimes(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {inspectionResultTimes[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = content.trim() === '' ? null : parseInt(content, 10);
                            setBoxCounts(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {boxCounts[rowNum]}
                    </td>
                    <td
                        className="border p-1 min-w-[60px] text-right hover:bg-blue-50 cursor-pointer"
                        onClick={(e) => handleCellClick(e, rowNum, true)}
                    >
                        {deadlines[rowNum] ? formatDate(deadlines[rowNum]) : ''}
                    </td>
                </tr>
            ))}
        </tbody>
    );
};