import { GraphQLResult } from '@aws-amplify/api-graphql';
import { generateClient } from 'aws-amplify/api';
import { useEffect, useState } from 'react';

interface ProductionData {
    orderNumber: string;
    processOptions: string;
    deadline: string;
    productName: string;
    orderQuantity: number;
    processPlanQuantity: number;
    processPlanTime: number;
    processResultQuantity: number;
    processResultTime: number;
    inspectionPlanQuantity: number;
    inspectionPlanTime: number;
    inspectionResultQuantity: number;
    inspectionResultTime: number;
    boxCount: number;
}

interface ListEchoProdManagementsQuery {
    listEchoProdManagements: {
        items: ProductionData[];
    };
}

interface ProductionDataHook {
    productionData: ProductionData[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useProductionData = (selectedDate: Date, processOptions: string = 'ラミネート'): ProductionDataHook => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [productionData, setProductionData] = useState<ProductionData[]>([]);
    const client = generateClient();

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const dateStr = `${year}${month}${day}`;

            const result = await client.graphql({
                query: `
                    query ListEchoProdManagement {
                        listEchoProdManagements(filter: {
                            orderNumber: { contains: "-${dateStr}" },
                            processOptions: { eq: "${processOptions}" }
                        }) {
                            items {
                                orderNumber
                                processOptions
                                deadline
                                productName
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
                    }
                `
            }) as GraphQLResult<ListEchoProdManagementsQuery>;

            const items = result.data?.listEchoProdManagements.items || [];
            setProductionData(items);
            setError(null);
        } catch (err) {
            console.error('データ取得エラー:', err);
            setError('データの取得に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    const refetch = async () => {
        await fetchData();
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate, processOptions]);

    return { productionData, isLoading, error, refetch };
};