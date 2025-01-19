import { GraphQLResult } from '@aws-amplify/api';
import { generateClient } from 'aws-amplify/api';
import React, { useEffect, useState } from 'react';

interface ScheduleItem {
    orderNumber: string;
    deadline: string;
    productName: string;
}

interface ListEchoProdManagementsQuery {
    listEchoProdManagements: {
        items: ScheduleItem[];
    }
}

const ProductionSchedule: React.FC = () => {
    const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
    const [dateRange, setDateRange] = useState<Date[]>([]);
    const client = generateClient();

    useEffect(() => {
        const fetchScheduleData = async () => {
            try {
                const result = await client.graphql({
                    query: `
                        query ListEchoProdManagement {
                            listEchoProdManagements {
                                items {
                                    orderNumber
                                    deadline
                                    productName
                                }
                            }
                        }
                    `
                }) as GraphQLResult<ListEchoProdManagementsQuery>;

                const items = result.data?.listEchoProdManagements.items || [];

                // orderNumberの日付部分で昇順ソート
                const sortedItems = [...items].sort((a, b) => {
                    const dateA = a.orderNumber.split('-')[1] || '';
                    const dateB = b.orderNumber.split('-')[1] || '';
                    return dateA.localeCompare(dateB);
                });

                // 重複を除去（同じorderNumberの異なる日付のエントリを統合）
                const uniqueItems = sortedItems.reduce((acc: ScheduleItem[], item: any) => {
                    const baseOrderNumber = item.orderNumber.split('-')[0];
                    const existing = acc.find(i => i.orderNumber.split('-')[0] === baseOrderNumber);
                    if (!existing && item.deadline) {
                        acc.push(item);
                    }
                    return acc;
                }, []);

                setScheduleItems(uniqueItems);
                generateDateRange(uniqueItems);
            } catch (error) {
                console.error('スケジュールデータの取得に失敗:', error);
            }
        };

        fetchScheduleData();
    }, []);

    const generateDateRange = (items: ScheduleItem[]) => {
        if (items.length === 0) return;

        // 時刻部分をリセット用のヘルパー関数
        const resetTime = (date: Date) => {
            date.setHours(0, 0, 0, 0);
            return date;
        };

        // 最も古い開始日を見つける
        const earliestStart = items.reduce((earliest, item) => {
            const startDate = parseDate(item.orderNumber.split('-')[1]);
            return startDate < earliest ? startDate : earliest;
        }, resetTime(new Date()));  // デフォルト値は現在日

        // 最長の納期日を見つける
        const latestDeadline = items.reduce((latest, item) => {
            const deadline = parseDate(item.deadline);
            return deadline > latest ? deadline : latest;
        }, earliestStart);

        // 開始日から最長納期日までの日数を計算
        const diffDays = Math.ceil(
            (latestDeadline.getTime() - earliestStart.getTime()) / (1000 * 60 * 60 * 24)
        );

        // 日付の配列を生成（最低でも7日分は表示）
        const dates = Array.from({ length: Math.max(diffDays + 1, 7) }, (_, i) => {
            const date = new Date(earliestStart);
            date.setDate(earliestStart.getDate() + i);
            return date;
        });

        setDateRange(dates);
    };

    const formatDate = (date: Date): string => {
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const parseDate = (dateStr: string): Date => {
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;  // 月は0-11
        const day = parseInt(dateStr.substring(6, 8));
        return new Date(year, month, day);
    };

    return (
        <div className="mt-8 overflow-x-auto">
            <div className="min-w-full">
                <div className="grid" style={{
                    gridTemplateColumns: `120px 200px repeat(${dateRange.length}, minmax(60px, 1fr))`,
                    gap: '1px',
                    backgroundColor: '#e5e7eb'
                }}>
                    {/* ヘッダー行 */}
                    <div className="bg-gray-100 p-2 font-bold">受注番号</div>
                    <div className="bg-gray-100 p-2 font-bold">製品</div>
                    {dateRange.map((date, index) => (
                        <div key={index} className="bg-gray-100 p-2 text-center">
                            {formatDate(date)}
                        </div>
                    ))}

                    {/* スケジュール行 */}
                    {scheduleItems.map((item, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                            <div className="bg-white p-2 border-b">
                                {item.orderNumber.split('-')[0]}
                            </div>
                            <div className="bg-white p-2 border-b">
                                {item.productName}
                            </div>
                            {dateRange.map((date, colIndex) => {
                                const currentDate = new Date(date);
                                const deadlineDate = parseDate(item.deadline);
                                const startDate = parseDate(item.orderNumber.split('-')[1]);
                                const isInRange = currentDate >= startDate && currentDate <= deadlineDate;
                                const isStart = currentDate.getTime() === startDate.getTime();
                                const isEnd = currentDate.getTime() === deadlineDate.getTime();

                                return (
                                    <div
                                        key={colIndex}
                                        className={`bg-white p-2 border-b flex items-center justify-center
                                            ${isInRange ? 'bg-blue-50' : ''}`}
                                    >
                                        {isInRange && (
                                            <div className="w-full flex items-center justify-center relative">
                                                {isStart ? (
                                                    <div className="w-full h-1 bg-blue-500 flex items-center">
                                                        <div className="absolute left-0 w-0 h-0 
                                                            border-t-[6px] border-t-transparent 
                                                            border-r-[10px] border-r-blue-500
                                                            border-b-[6px] border-b-transparent"
                                                        />
                                                    </div>
                                                ) : isEnd ? (
                                                    <div className="w-full h-1 bg-blue-500 flex items-center">
                                                        <div className="absolute right-0 w-0 h-0 
                                                            border-t-[6px] border-t-transparent 
                                                            border-l-[10px] border-l-blue-500
                                                            border-b-[6px] border-b-transparent"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-1 bg-blue-500" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductionSchedule; 