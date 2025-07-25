'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './navbar.module.css';
import { LuSearch } from "react-icons/lu";
// import { TbHttpOptions } from "react-icons/tb";
import { FiMenu } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import Image from 'next/image';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();
    const [spanStyle, setSpanStyle] = useState({ left: 0, width: 0 });
    const [isSearchActive, setIsSearchActive] = useState(false);
    const navRef = useRef(null);
    const inputRef = useRef(null);
    const headerRef = useRef(null);

    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const navLinks = [
        { path: "/pages/home", name: "Home" },
        { path: "/pages/about_us", name: "About Us" },
        { path: "/pages/articles", name: "Articles" },
        { path: "/pages/newsletter", name: "Newsletter" },
        { path: "/pages/donation", name: "Donation" },
        { path: "/pages/contact", name: "Contact Us" }
    ];

    const updateSpanPosition = (index) => {
        const links = navRef.current?.querySelectorAll('a');
        if (!links || !links[index]) return;

        setSpanStyle(isMobile ? {
            left: 0,
            width: '100%',
            top: links[index].offsetTop,
            height: links[index].offsetHeight
        } : {
            left: links[index].offsetLeft,
            width: links[index].offsetWidth,
        });
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            if (window.innerWidth > 768) setIsMenuOpen(false);
        };

        const debounce = (func, delay) => {
            let timer;
            return () => {
                clearTimeout(timer);
                timer = setTimeout(func, delay);
            };
        };

        const debouncedResize = debounce(handleResize, 150);

        window.addEventListener('resize', debouncedResize);
        return () => window.removeEventListener('resize', debouncedResize);
    }, []);

    useEffect(() => {
        const activeIndex = navLinks.findIndex(link => pathname === link.path);
        if (activeIndex >= 0) {
            updateSpanPosition(activeIndex);
        }
        if (pathname !== "/") {
            setIsSearchActive(false);
        }
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isSearchActive && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearchActive]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                isMenuOpen &&
                headerRef.current &&
                !headerRef.current.contains(e.target)
            ) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMenuOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/pages/articles?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchActive(false);
            setSearchQuery('');
        } else {
            router.push('/pages/articles');
        }

    };

    return (
        <header ref={headerRef} className={`${styles.header} ${isSearchActive ? styles.blur : ''}`}>
            <nav className={styles.navbody} ref={navRef}
                onMouseLeave={() => {
                    if (pathname === "/pages/donation") {
                        setSpanStyle({ left: 0, width: 0 });
                    }
                }}>
                <div className={styles.navContainer}>
                    <Image
                        src="/Umeedlogo.png"
                        alt="Logo"
                        width={150}
                        height={50}
                        className={styles.logo}
                        priority
                        onLoad={() => {
                            const activeIndex = navLinks.findIndex(link => pathname === link.path);
                            updateSpanPosition(activeIndex >= 0 ? activeIndex : 0);
                        }}
                    />
                    <button
                        className={styles.hamburger}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    >
                        <div className={styles.iconContainer}>
                            <FiMenu className={`${styles.icon} ${isMenuOpen ? styles.hidden : ''}`} />
                            <RxCross2 className={`${styles.icon} ${!isMenuOpen ? styles.hidden : ''}`} />
                        </div>
                    </button>
                    <div className={`${styles.navLinks} ${isMenuOpen ? styles.showMenu : ''}`}>
                        <span style={spanStyle}></span>
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={link.path === "/pages/donation" ? styles.donationBorder : ""}
                                onClick={() => {
                                    if (isMobile) {
                                        setIsMenuOpen(false);
                                        updateSpanPosition(index);
                                    }
                                }}
                                onMouseEnter={() => {
                                    if (link.path === "/pages/donation") return;
                                    updateSpanPosition(index);
                                }}
                                onMouseLeave={() => {
                                    const activeIndex = navLinks.findIndex(l =>
                                        pathname === l.path && l.path !== "/pages/donation"
                                    );
                                    if (activeIndex >= 0) {
                                        updateSpanPosition(activeIndex);
                                    }
                                }}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {(pathname === "/pages/articles") && (
                        <form
                            onSubmit={handleSearch}
                            className={`${styles.searchBox} ${isSearchActive ? styles.active : ''}`}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onBlur={() => !searchQuery && setIsSearchActive(false)}
                            />
                            <button
                                type="submit"
                                onClick={() => {
                                    if (!isSearchActive) {
                                        setIsSearchActive(true);
                                    }
                                }}
                            >
                                <LuSearch />
                            </button>
                        </form>
                    )}
                </div>
            </nav>
            {isMenuOpen && isMobile && (
                <div 
                    className={styles.backdrop} 
                    onClick={() => setIsMenuOpen(false)}
                />
            )}
        </header>
    );
};

export default React.memo(Navbar);
