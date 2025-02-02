import { GraphQLResult } from '@aws-amplify/api-graphql';
import { generateClient } from 'aws-amplify/api';
import { formatDateToString, generateDateRange, parseStringToDate } from '../../../utils/dateUtils';

interface RowDataInput {
    rowNum: string;
    currentDateStr: string;
    orderNumbers: { [key: string]: string };
    deadlines: { [key: string]: string };
    productNames: { [key: string]: string };
    orderQuantities: { [key: string]: number };
    selectedProcess: string;
}

export const saveRowData = async ({
    rowNum,
    currentDateStr,
    orderNumbers,
    deadlines,
    productNames,
    orderQuantities,
    selectedProcess
}: RowDataInput): Promise<boolean> => {
    const client = generateClient();

    try {
        const orderNumber = orderNumbers[rowNum];
        if (!orderNumber) return false;

        const baseOrderNumber = orderNumber.split('-')[0];
        const deadline = deadlines[rowNum];
        const productName = productNames[rowNum];
        const orderQuantity = orderQuantities[rowNum];

        // 入力チェック
        if (!productName) {
            alert(`行 ${rowNum} の品名が入力されていません`);
            return false;
        }

        if (orderQuantity === null || orderQuantity === undefined) {
            alert(`行 ${rowNum} の受注数が入力されていません`);
            return false;
        }

        // 納期日の入力チェックを追加
        if (!deadline) {
            alert(`行 ${rowNum} の納期日が入力されていません`);
            return false;
        }

        // 納期日が現在の日付より前の場合はエラー
        const deadlineDate = parseStringToDate(deadline);
        const currentDate = parseStringToDate(currentDateStr);
        if (deadlineDate < currentDate) {
            alert(`行 ${rowNum} の納期日が現在の日付より前になっています`);
            return false;
        }

        // まず既存レコードの納期を確認（同じprocessOptionsのみ）
        const existingResult = await client.graphql({
            query: `
                    query GetExistingRecord {
                        listEchoProdManagements(
                            filter: {
                                orderNumber: { beginsWith: "${baseOrderNumber}-" },
                                processOptions: { eq: "${selectedProcess}" }
                            }
                        ) {
                            items {
                                orderNumber
                                deadline
                                processOptions
                            }
                        }
                    }
                `
        }) as GraphQLResult<{
            listEchoProdManagements: {
                items: Array<{
                    orderNumber: string;
                    deadline: string;
                    processOptions: string;
                }>;
            };
        }>;

        const existingRecords = existingResult.data?.listEchoProdManagements?.items || [];
        const existingDeadline = existingRecords[0]?.deadline;

        // 納期が変更された場合の処理
        if (existingDeadline && existingDeadline !== deadline) {
            for (const record of existingRecords) {
                const recordDate = record.orderNumber.split('-')[1];
                if (parseInt(recordDate) > parseInt(deadline)) {
                    // 新しい納期より後のレコードは削除
                    await client.graphql({
                        query: `
                                mutation DeleteEchoProdManagement {
                                    deleteEchoProdManagement(
                                        input: {
                                            orderNumber: "${record.orderNumber}",
                                            processOptions: "${selectedProcess}"
                                        }
                                    ) {
                                        orderNumber
                                    }
                                }
                            `
                    });
                } else {
                    // 残すレコードは納期を更新
                    await client.graphql({
                        query: `
                                mutation UpdateEchoProdManagement {
                                    updateEchoProdManagement(
                                        input: {
                                            orderNumber: "${record.orderNumber}",
                                            processOptions: "${selectedProcess}",
                                            deadline: "${deadline}",
                                            productName: "${productName}",
                                            orderQuantity: ${orderQuantity}
                                        }
                                    ) {
                                        orderNumber
                                    }
                                }
                            `
                    });
                }
            }
        }

        // 新規レコードの作成（現在の日付から納期までの範囲で）
        const dateRange = generateDateRange(parseStringToDate(currentDateStr), parseStringToDate(deadline));
        const createPromises = dateRange
            .map(date => {
                const dateStr = formatDateToString(date);
                const uniqueOrderNumber = `${baseOrderNumber}-${dateStr}`;

                if (!existingRecords.some(record => record.orderNumber === uniqueOrderNumber)) {
                    return client.graphql({
                        query: `
                                mutation CreateEchoProdManagement {
                                    createEchoProdManagement(
                                        input: {
                                            orderNumber: "${uniqueOrderNumber}",
                                            processOptions: "${selectedProcess}",
                                            deadline: "${deadline}",
                                            productName: "${productName}",
                                            orderQuantity: ${orderQuantity}
                                        }
                                    ) {
                                        orderNumber
                                    }
                                }
                            `
                    });
                }
                return null;
            })
            .filter(promise => promise !== null);

        await Promise.all(createPromises);

        return true;
    } catch (error) {
        console.error('保存エラー:', error);
        return false;
    }
};