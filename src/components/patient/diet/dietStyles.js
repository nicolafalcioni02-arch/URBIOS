// CSS del modulo Dieta, iniettato via <style> in DietPlan (volutamente NON globale: evita conflitti con Training e con gli stili globali).
// L'ORDINE conta (cascata CSS): non riordinare.
import { sidebarStyles } from './styles/sidebarStyles';
import { contentStyles } from './styles/contentStyles';
import { modalAndPrintStyles } from './styles/modalAndPrintStyles';
import { dashboardStyles } from './styles/dashboardStyles';
import { analysisStyles } from './styles/analysisStyles';
import { setupModalStyles } from './styles/setupModalStyles';
import { lafStyles } from './styles/lafStyles';
import { smartChartStyles } from './styles/smartChartStyles';

export const dietCss = [sidebarStyles, contentStyles, modalAndPrintStyles, dashboardStyles, analysisStyles, setupModalStyles, lafStyles, smartChartStyles].join(
    '\n'
);
