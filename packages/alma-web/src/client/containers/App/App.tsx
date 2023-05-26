import { inject } from '@vercel/analytics';
import * as React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';

import { transitionGroupWrapperStyles } from './App.styles';
import { ModalProvider } from '../../providers/ModalProvider/ModalProvider';
import { CircuitRoute } from '../../routes/CircuitRoute/CircuitRoute';
import { LandingRoute } from '../../routes/LandingRoute/LandingRoute';

inject();

export const App = () => {
    return (
        <Router>
            <ModalProvider>
                <AppRoutes />
            </ModalProvider>
        </Router>
    );
};

export const AppRoutes = () => {
    return (
        <TransitionGroup className={transitionGroupWrapperStyles}>
            {/*
            This is no different than other usage of
            <CSSTransition>, just make sure to pass
            `location` to `Switch` so it can match
            the old location as it animates out.
          */}
            <CSSTransition key={location.pathname} classNames="fade" timeout={300}>
                <Routes location={location}>
                    <Route path="/" element={<LandingRoute />} index />
                    <Route path="/playground" element={<CircuitRoute />} />
                </Routes>
            </CSSTransition>
        </TransitionGroup>
    );
};
