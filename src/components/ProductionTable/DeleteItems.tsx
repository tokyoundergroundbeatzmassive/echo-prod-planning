import { GraphQLResult } from '@aws-amplify/api-graphql';
import { generateClient } from 'aws-amplify/api';

interface EchoProdManagement {
    orderNumber: string;
    processOptions: string;
}

interface ListEchoProdManagementsResponse {
    listEchoProdManagements: {
        items: EchoProdManagement[];
    }
}

export const deleteProductionRecords = async (baseOrderNumber: string, processOptions: string) => {
    const client = generateClient();

    try {
        const result = (await client.graphql({
            query: `
                query ListRelatedRecords {
                    listEchoProdManagements(
                        filter: {
                            orderNumber: { beginsWith: "${baseOrderNumber}-" }
                            processOptions: { eq: "${processOptions}" }
                        }
                    ) {
                        items {
                            orderNumber
                            processOptions
                        }
                    }
                }
            `
        })) as GraphQLResult<ListEchoProdManagementsResponse>;

        if (!result.data) throw new Error('No data returned');

        // 削除処理を配列として準備
        const deletePromises = result.data.listEchoProdManagements.items.map(item =>
            client.graphql({
                query: `
                    mutation DeleteRecord {
                        deleteEchoProdManagement(
                            input: {
                                orderNumber: "${item.orderNumber}"
                                processOptions: "${processOptions}"
                            }
                        ) {
                            orderNumber
                        }
                    }
                `
            })
        );

        // 全ての削除処理を並列実行
        await Promise.all(deletePromises);
        alert(`${result.data.listEchoProdManagements.items.length}件のレコードを削除しました`);
        return true;

    } catch (error) {
        console.error('削除エラー:', error);
        if (error instanceof Error) {
            alert(`エラーが発生しました: ${error.message}`);
        } else {
            alert('予期せぬエラーが発生しました');
        }
        return false;
    }
};