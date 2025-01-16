import React from 'react';
import { AiOutlineMinusCircle, AiOutlinePlusCircle } from 'react-icons/ai';
import { formatDate } from '../../utils/formatDate';

interface ProductionTableBodyProps {
    rows: number[];
    rowCount: number;
    orderNumbers: { [key: number]: string };
    productNames: { [key: number]: string };
    deadlines: { [key: number]: string };
    orderQuantities: { [key: number]: number };
    processPlanQuantities: { [key: number]: number };
    setOrderNumbers: (value: React.SetStateAction<{ [key: number]: string }>) => void;
    setProductNames: (value: React.SetStateAction<{ [key: number]: string }>) => void;
    handleCellClick: (event: React.MouseEvent<HTMLTableCellElement>, rowNum: number, isDeadlineCell: boolean) => void;
    addRow: () => void;
    removeRow: () => void;
    setOrderQuantities: (value: React.SetStateAction<{ [key: number]: number }>) => void;
    setProcessPlanQuantities: (value: React.SetStateAction<{ [key: number]: number }>) => void;
}

export const ProductionTableBody: React.FC<ProductionTableBodyProps> = ({
    rows,
    rowCount,
    orderNumbers,
    productNames,
    deadlines,
    orderQuantities,
    processPlanQuantities,
    setOrderNumbers,
    setProductNames,
    handleCellClick,
    addRow,
    removeRow,
    setOrderQuantities,
    setProcessPlanQuantities
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
                        {rowNum}
                    </td>
                    <td
                        className="border p-1"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
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
                        className="border p-1"
                        contentEditable={true}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => {
                            const content = e.currentTarget?.textContent ?? '';
                            const numberValue = parseInt(content, 10) || 0;
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
                            const numberValue = parseInt(content, 10) || 0;
                            setProcessPlanQuantities(prev => ({
                                ...prev,
                                [rowNum]: numberValue
                            }));
                        }}
                    >
                        {processPlanQuantities[rowNum]}
                    </td>
                    {Array.from({ length: 8 }, (_, i) => (
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
    );
}; 