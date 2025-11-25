"use client";

import { motion, useAnimation, Variants } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

const iconVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -10 },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15,
            staggerChildren: 0.2,
        },
    },
};

const pathVariants: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
            duration: 1.5,
            ease: "easeInOut",
        },
    },
};

// Helper function to create variants with delay
const createDelayedVariants = (delay: number): Variants => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
            duration: 1.5,
            ease: "easeInOut",
            delay,
        },
    },
});

export const AutomatedCampaignsIcon = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
    useEffect(() => {
        if (inView) controls.start("visible");
    }, [controls, inView]);

    return (
        <motion.svg
            ref={ref}
            variants={iconVariants}
            initial="hidden"
            animate={controls}
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[var(--color-gold)]"
        >
            {/* Main structure */}
            <motion.path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" variants={pathVariants} strokeWidth="0.25" />
            
            {/* Abstract representation of a sequence/flow */}
            <motion.path d="M8 8l3 3-3 3" variants={createDelayedVariants(0.2)} />
            <motion.path d="M13 8l3 3-3 3" variants={createDelayedVariants(0.4)} />

            {/* Cog for "automation" */}
            <motion.g transform="translate(16 16) scale(0.8)">
                 <motion.path d="M0 -2.5 a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5z" variants={pathVariants} strokeWidth="0.5" />
                 <motion.path d="M0 -3.5 v-1 M0 3.5 v1 M-3.5 0 h-1 M3.5 0 h1" strokeWidth="0.5" variants={createDelayedVariants(0.6)} />
            </motion.g>
        </motion.svg>
    );
};

export const LeadManagementIcon = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
    useEffect(() => {
        if (inView) controls.start("visible");
    }, [controls, inView]);

    return (
        <motion.svg
            ref={ref}
            variants={iconVariants}
            initial="hidden"
            animate={controls}
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[var(--color-gold)]"
        >
            {/* Stack of cards */}
            <motion.rect x="6" y="9" width="12" height="8" rx="1" variants={createDelayedVariants(0.6)} fill="currentColor" fillOpacity={0.1} />
            <motion.rect x="4" y="7" width="12" height="8" rx="1" variants={createDelayedVariants(0.4)} fill="currentColor" fillOpacity={0.2} />
            <motion.rect x="2" y="5" width="12" height="8" rx="1" variants={createDelayedVariants(0.2)} />

            {/* Abstract user icon */}
            <motion.circle cx="17" cy="8" r="2" variants={createDelayedVariants(0.8)} />
            <motion.path d="M17 10v2a2 2 0 0 1-2 2h-1" variants={createDelayedVariants(1)} />
        </motion.svg>
    );
};

export const AIPersonalizationIcon = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
    useEffect(() => {
        if (inView) controls.start("visible");
    }, [controls, inView]);

    const starVariants = (delay: number): Variants => ({
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: [0, 1.2, 1],
            opacity: [0, 1, 0],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1,
                delay: delay + 0.5,
            },
        },
    });

    return (
        <motion.svg
            ref={ref}
            variants={iconVariants}
            initial="hidden"
            animate={controls}
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[var(--color-gold)]"
        >
            {/* Brain/Core element */}
            <motion.path d="M12 2a10 10 0 0 0-4.47 18.24" variants={pathVariants} />
            <motion.path d="M12 2a10 10 0 0 1 4.47 18.24" variants={createDelayedVariants(0.2)} />
            <motion.path d="M6.34 6.34a8 8 0 0 0 11.32 0" variants={createDelayedVariants(0.4)} />
            <motion.path d="M6.34 17.66a8 8 0 0 0 11.32 0" variants={createDelayedVariants(0.6)} />
            <motion.circle cx="12" cy="12" r="2" fill="currentColor" variants={createDelayedVariants(0.8)} />

            {/* Stars for "magic" */}
            <motion.path d="M18 6l.5.5" variants={starVariants(0)} />
            <motion.path d="M6 18l.5.5" variants={starVariants(0.3)} />
            <motion.path d="M6 6l.5-.5" variants={starVariants(0.6)} />
            <motion.path d="M18 18l.5-.5" variants={starVariants(0.9)} />
        </motion.svg>
    );
};

export const AnalyticsIcon = () => {
    const controls = useAnimation();
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
    useEffect(() => {
        if (inView) controls.start("visible");
    }, [controls, inView]);

    const lineVariants = (delay: number): Variants => ({
        hidden: { pathLength: 0 },
        visible: {
            pathLength: 1,
            transition: { duration: 1, ease: "circOut", delay },
        },
    });

    return (
        <motion.svg
            ref={ref}
            variants={iconVariants}
            initial="hidden"
            animate={controls}
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-[var(--color-gold)]"
        >
            <motion.path d="M3 3v18h18" variants={lineVariants(0)} />
            <motion.path d="M18.7 8a2 2 0 0 1-2.1-2.1L13 2" variants={lineVariants(0.2)} />
            <motion.path d="M8.25 7.5a2.5 2.5 0 0 1-2.5-2.5L2 12" variants={lineVariants(0.4)} />
            <motion.path d="M12 17l-4-4-4 4" variants={lineVariants(0.6)} />
            <motion.circle cx="18" cy="5" r="1" fill="currentColor" />
            <motion.circle cx="8" cy="10" r="1" fill="currentColor" />
            <motion.circle cx="12" cy="17" r="1" fill="currentColor" />
        </motion.svg>
    );
};
