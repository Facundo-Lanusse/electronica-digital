import React, { useState } from 'react';
import { motion } from 'framer-motion';
import '../css/Home.css';
import { useNavigate } from 'react-router-dom';


const itemVariants = {
    open: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    closed: {
        opacity: 0,
        y: 20,
        transition: { duration: 0.2 }
    }
};

function Home() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();


    return (
        <div style={{ padding: '2rem', position: 'relative', zIndex: 1 }}>

            <h2 style={{color: 'white'}}>Home</h2>

            <motion.nav
                initial={false}
                animate={isOpen ? "open" : "closed"}
                className="menu"
            >
                <motion.button
                    className="menu-toggle"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    Menú
                    <motion.div
                        variants={{
                            open: { rotate: 180 },
                            closed: { rotate: 0 }
                        }}
                        transition={{ duration: 0.2 }}
                        style={{ originY: 0.55 }}
                    >
                        <svg width="15" height="15" viewBox="0 0 20 20">
                            <path d="M0 7 L 20 7 L 10 16" fill="white" />
                        </svg>
                    </motion.div>
                </motion.button>

                <motion.ul
                    className="menu-list"
                    variants={{
                        open: {
                            clipPath: "inset(0% 0% 0% 0% round 10px)",
                            transition: {
                                type: "spring",
                                bounce: 0,
                                duration: 0.7,
                                delayChildren: 0.3,
                                staggerChildren: 0.05
                            }
                        },
                        closed: {
                            clipPath: "inset(10% 50% 90% 50% round 10px)",
                            transition: {
                                type: "spring",
                                bounce: 0,
                                duration: 0.3
                            }
                        }
                    }}
                    style={{pointerEvents: isOpen ? "auto" : "none"}}
                >
                    <motion.li variants={itemVariants} onClick={() => navigate('/reservar')}>
                        Reservar
                    </motion.li>
                    <motion.li variants={itemVariants}>Mis Reservas</motion.li>
                    <motion.li variants={itemVariants}>Perfil</motion.li>
                </motion.ul>
            </motion.nav>
        </div>
    );
}

export default Home;
