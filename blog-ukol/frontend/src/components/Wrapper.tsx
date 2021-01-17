import { Box } from '@chakra-ui/react';
import React from 'react';

export type WrapperVariant = "small" | "regular";

interface WrapperProps {
    variant?:  WrapperVariant;
}

const Wrapper: React.FC<WrapperProps> = ({ 
    children,
    variant = "regular"
}) => {
        return (
            <Box 
                mt={8} 
                mx="auto" 
                maxW={variant === "regular" ? "80%" : "400px"} 
                w="100%"
                p={4}
            >
                {children}
            </Box>
        );
};

export default Wrapper;