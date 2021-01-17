import DataLoader from "dataloader";
import { Updoot } from "../entities/Updoot";

export const createUpdootLoader = () =>  
    new DataLoader<{ commentId: number, userId: number}, Updoot | null>(
        async (keys) => {
        const updoots = await Updoot.findByIds(keys as any);
        const updootIdsToUpdoot: Record<string, Updoot> = {};
        updoots.forEach((updoot) => {
            updootIdsToUpdoot[`${updoot.userId}|${updoot.commentId}`] = updoot;
    });

    return keys.map((key) => updootIdsToUpdoot[`${key.userId}|${key.commentId}`]);
});