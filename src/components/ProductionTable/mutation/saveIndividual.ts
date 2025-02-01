import { GraphQLResult } from '@aws-amplify/api-graphql';
import { generateClient } from 'aws-amplify/api';

interface DetailDataInput {
    rowNum: string;
    currentDateStr: string;
    orderNumbers: { [key: string]: string };
    selectedProcess: string;
    orderQuantities: { [key: string]: number | null };
    processPlanQuantities: { [key: string]: number | null };
    processPlanTimes: { [key: string]: number | null };
    processResultQuantities: { [key: string]: number | null };
    processResultTimes: { [key: string]: number | null };
    inspectionPlanQuantities: { [key: string]: number | null };
    inspectionPlanTimes: { [key: string]: number | null };
    inspectionResultQuantities: { [key: string]: number | null };
    inspectionResultTimes: { [key: string]: number | null };
    boxCounts: { [key: string]: number | null };
}

// 個別データ更新用の関数
export const saveDetailData = async ({
    rowNum,
    currentDateStr,
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
}: DetailDataInput): Promise<boolean> => {
    const client = generateClient();

    const orderNumber = orderNumbers[rowNum];
    if (!orderNumber) return false;

    const uniqueOrderNumber = `${orderNumber}-${currentDateStr}`;

    // 値がある場合のみオブジェクトに追加
    const detailInput: any = {
        orderNumber: uniqueOrderNumber,
        processOptions: selectedProcess,
    };

    if (orderQuantities[rowNum] !== null) {
        detailInput.orderQuantity = orderQuantities[rowNum];
    }

    // 各フィールドが存在する場合のみ追加
    if (processPlanQuantities[rowNum] !== null) {
        detailInput.processPlanQuantity = processPlanQuantities[rowNum];
    }
    if (processPlanTimes[rowNum] !== null) {
        detailInput.processPlanTime = processPlanTimes[rowNum];
    }
    if (processResultQuantities[rowNum] !== null) {
        detailInput.processResultQuantity = processResultQuantities[rowNum];
    }
    if (processResultTimes[rowNum] !== null) {
        detailInput.processResultTime = processResultTimes[rowNum];
    }
    if (inspectionPlanQuantities[rowNum] !== null) {
        detailInput.inspectionPlanQuantity = inspectionPlanQuantities[rowNum];
    }
    if (inspectionPlanTimes[rowNum] !== null) {
        detailInput.inspectionPlanTime = inspectionPlanTimes[rowNum];
    }
    if (inspectionResultQuantities[rowNum] !== null) {
        detailInput.inspectionResultQuantity = inspectionResultQuantities[rowNum];
    }
    if (inspectionResultTimes[rowNum] !== null) {
        detailInput.inspectionResultTime = inspectionResultTimes[rowNum];
    }
    if (boxCounts[rowNum] !== null) {
        detailInput.boxCount = boxCounts[rowNum];
    }

    try {
        // まず既存レコードの確認
        const existingResult = await client.graphql({
            query: `
                query GetExistingRecord {
                    getEchoProdManagement(
                        orderNumber: "${uniqueOrderNumber}",
                        processOptions: "${selectedProcess}"
                    ) {
                        orderNumber
                    }
                }
            `
        }) as GraphQLResult<{
            getEchoProdManagement: {
                orderNumber: string;
            } | null;
        }>;

        const mutation = existingResult.data?.getEchoProdManagement
            ? `
                mutation UpdateEchoProdManagement($input: UpdateEchoProdManagementInput!) {
                    updateEchoProdManagement(input: $input) {
                        orderNumber
                        processOptions
                        orderQuantity
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
            `
            : `
                mutation CreateEchoProdManagement($input: CreateEchoProdManagementInput!) {
                    createEchoProdManagement(input: $input) {
                        orderNumber
                        processOptions
                    }
                }
            `;

        await client.graphql({
            query: mutation,
            variables: { input: detailInput }
        });

        return true;
    } catch (error) {
        console.error('詳細データの保存エラー:', error);
        alert('詳細データの保存中にエラーが発生しました');
        return false;
    }
};