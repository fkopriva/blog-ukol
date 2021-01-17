import { usePostQuery, useRelatedPostsQuery } from "../generated/graphql";
import { useGetIntId } from "./useGetIntId";

export const useGetPostFromUrl = () => {
    const intId = useGetIntId();
    return usePostQuery({
        pause: intId === -1,
        variables: {
            id: intId,
        },
    });
};

export const useGetRelatedPostsFromUrl = () => {
    const intId = useGetIntId();
    return useRelatedPostsQuery({
        pause: intId === -1,
        variables: {
            postId: intId,
        },
    });
};