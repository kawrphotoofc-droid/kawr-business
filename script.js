/*
 * KAWR BUSINESS — MOTOR DEMONSTRATIVO
 * Regras de domínio separadas da apresentação para facilitar futura integração com APIs.
 * Simulações tributárias são educacionais e exigem validação profissional.
 */

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const number = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const pct = value => `${number.format(value)}%`;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const money = value => brl.format(Number.isFinite(value) ? value : 0);
const compactMoney = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);

const appMeta = {
  overview: ["ANÁLISE / VISÃO GERAL", "Visão geral"],
  financas: ["ANÁLISE / BASE DE DADOS", "Dados financeiros"],
  calculadoras: ["ANÁLISE / FERRAMENTAS", "Calculadoras"],
  tributos: ["ANÁLISE / CENÁRIOS", "Simulação tributária"],
  alertas: ["INTELIGÊNCIA / MONITORAMENTO", "Alertas"],
  score: ["INTELIGÊNCIA / SAÚDE FINANCEIRA", "Score financeiro"],
  relatorio: ["INTELIGÊNCIA / DOCUMENTO", "Relatório consolidado"]
};

const exampleData = {
  revenue: 128400,
  variableCost: 38520,
  fixedCost: 38400,
  payroll: 28600,
  initialCash: 23780,
  receivables: 42800,
  payables: 31500,
  previousRevenue: 114200
};

const state = {
  financial: { ...exampleData },
  tax: {
    regime: "simples",
    revenue: 128400,
    rbt12: 1398000,
    payroll12: 412000,
    profile: "service",
    result: null
  },
  currentCalculator: "margin",
  alertFilter: "all"
};

function getFinancialMetrics() {
  const f = state.financial;
  const expenses = f.variableCost + f.fixedCost;
  const estimatedOperationalTax = f.revenue * 0.1009345794;
  const profit = f.revenue - expenses - estimatedOperationalTax;
  const margin = f.revenue > 0 ? (profit / f.revenue) * 100 : 0;
  const contributionMargin = f.revenue - f.variableCost;
  const contributionRate = f.revenue > 0 ? contributionMargin / f.revenue : 0;
  const breakEven = contributionRate > 0 ? f.fixedCost / contributionRate : 0;
  const cashOut = expenses + estimatedOperationalTax;
  const cash = f.initialCash + f.revenue - cashOut;
  const currentAssets = Math.max(cash, 0) + f.receivables;
  const liquidity = f.payables > 0 ? currentAssets / f.payables : 3;
  const growth = f.previousRevenue > 0 ? ((f.revenue - f.previousRevenue) / f.previousRevenue) * 100 : 0;
  const expenseRatio = f.revenue > 0 ? (expenses / f.revenue) * 100 : 0;
  return { expenses, estimatedOperationalTax, profit, margin, contributionMargin, contributionRate, breakEven, cashOut, cash, liquidity, growth, expenseRatio };
}

const calculatorDefinitions = {
  margin: {
    index: "01 / 07", eyebrow: "RENTABILIDADE", title: "Margem de lucro", description: "Descubra quanto do faturamento se converte em resultado líquido.",
    fields: [{ key: "revenue", label: "Receita total", prefix: "R$" }, { key: "profit", label: "Lucro líquido", prefix: "R$" }],
    defaults: () => ({ revenue: state.financial.revenue, profit: getFinancialMetrics().profit }),
    calculate: v => ({ value: v.revenue ? (v.profit / v.revenue) * 100 : 0, formatted: pct(v.revenue ? (v.profit / v.revenue) * 100 : 0), interpretation: `A cada R$ 100 faturados, ${money(v.revenue ? (v.profit / v.revenue) * 100 : 0)} permanecem como lucro.`, formula: "Margem líquida = (Lucro líquido ÷ Receita total) × 100", steps: [`Divida ${money(v.profit)} por ${money(v.revenue)}.`, `Multiplique o quociente por 100 para converter em percentual.`] })
  },
  netprofit: {
    index: "02 / 07", eyebrow: "RESULTADO", title: "Lucro líquido", description: "Estime o valor restante após custos, despesas e tributos.",
    fields: [{ key: "revenue", label: "Receita", prefix: "R$" }, { key: "costs", label: "Custos e despesas", prefix: "R$" }, { key: "taxes", label: "Tributos estimados", prefix: "R$" }],
    defaults: () => ({ revenue: state.financial.revenue, costs: getFinancialMetrics().expenses, taxes: getFinancialMetrics().estimatedOperationalTax }),
    calculate: v => { const result = v.revenue - v.costs - v.taxes; return { value: result, formatted: money(result), interpretation: result >= 0 ? "A operação apresenta resultado líquido positivo no cenário informado." : "O cenário apresenta prejuízo e requer revisão de custos, preço ou receita.", formula: "Lucro líquido = Receita − Custos e despesas − Tributos", steps: [`Subtraia ${money(v.costs)} da receita de ${money(v.revenue)}.`, `Subtraia os tributos estimados de ${money(v.taxes)}.`] }; }
  },
  breakeven: {
    index: "03 / 07", eyebrow: "SUSTENTAÇÃO", title: "Ponto de equilíbrio", description: "Calcule a receita mínima para cobrir custos fixos e variáveis.",
    fields: [{ key: "fixed", label: "Custos fixos", prefix: "R$" }, { key: "revenue", label: "Receita de referência", prefix: "R$" }, { key: "variable", label: "Custos variáveis", prefix: "R$" }],
    defaults: () => ({ fixed: state.financial.fixedCost, revenue: state.financial.revenue, variable: state.financial.variableCost }),
    calculate: v => { const rate = v.revenue ? (v.revenue - v.variable) / v.revenue : 0; const result = rate > 0 ? v.fixed / rate : 0; return { value: result, formatted: money(result), interpretation: `A receita precisa atingir aproximadamente ${money(result)} para cobrir a estrutura informada.`, formula: "Ponto de equilíbrio = Custos fixos ÷ Margem de contribuição (%)", steps: [`Margem de contribuição: (${money(v.revenue)} − ${money(v.variable)}) ÷ ${money(v.revenue)} = ${pct(rate * 100)}.`, `Divida ${money(v.fixed)} por ${pct(rate * 100)}.`] }; }
  },
  markup: {
    index: "04 / 07", eyebrow: "PRECIFICAÇÃO", title: "Markup", description: "Encontre o multiplicador de preço sobre o custo base.",
    fields: [{ key: "cost", label: "Custo do produto/serviço", prefix: "R$" }, { key: "expenses", label: "Despesas + tributos", suffix: "%" }, { key: "margin", label: "Margem desejada", suffix: "%" }],
    defaults: () => ({ cost: 100, expenses: 25, margin: 20 }),
    calculate: v => { const denominator = 1 - ((v.expenses + v.margin) / 100); const factor = denominator > 0 ? 1 / denominator : 0; const price = v.cost * factor; return { value: factor, formatted: `${number.format(factor)}× · ${money(price)}`, interpretation: `O preço sugerido pelo modelo é ${money(price)} para o custo informado.`, formula: "Markup = 1 ÷ [1 − (Despesas% + Margem%)]", steps: [`Some ${pct(v.expenses)} de despesas e ${pct(v.margin)} de margem.`, `Subtraia ${pct(v.expenses + v.margin)} de 100%.`, `Divida 1 pelo percentual restante e multiplique por ${money(v.cost)}.`] }; }
  },
  percentage: {
    index: "05 / 07", eyebrow: "VARIAÇÃO", title: "Percentuais", description: "Meça a variação percentual entre dois valores.",
    fields: [{ key: "old", label: "Valor anterior", prefix: "R$" }, { key: "current", label: "Valor atual", prefix: "R$" }],
    defaults: () => ({ old: state.financial.previousRevenue, current: state.financial.revenue }),
    calculate: v => { const result = v.old ? ((v.current - v.old) / Math.abs(v.old)) * 100 : 0; return { value: result, formatted: pct(result), interpretation: result >= 0 ? `Houve crescimento de ${pct(result)} entre os valores.` : `Houve retração de ${pct(Math.abs(result))} entre os valores.`, formula: "Variação% = [(Valor atual − Valor anterior) ÷ |Valor anterior|] × 100", steps: [`Calcule ${money(v.current)} − ${money(v.old)}.`, `Divida a diferença pelo valor anterior e multiplique por 100.`] }; }
  },
  cashflow: {
    index: "06 / 07", eyebrow: "LIQUIDEZ", title: "Fluxo de caixa", description: "Calcule o saldo final após entradas e saídas do período.",
    fields: [{ key: "initial", label: "Saldo inicial", prefix: "R$" }, { key: "inflow", label: "Entradas", prefix: "R$" }, { key: "outflow", label: "Saídas", prefix: "R$" }],
    defaults: () => ({ initial: state.financial.initialCash, inflow: state.financial.revenue, outflow: getFinancialMetrics().cashOut }),
    calculate: v => { const result = v.initial + v.inflow - v.outflow; return { value: result, formatted: money(result), interpretation: result >= 0 ? "O caixa encerra o período em posição positiva." : "O caixa encerra o período negativo e exige ação de curto prazo.", formula: "Saldo final = Saldo inicial + Entradas − Saídas", steps: [`Some o saldo inicial de ${money(v.initial)} às entradas de ${money(v.inflow)}.`, `Subtraia as saídas de ${money(v.outflow)}.`] }; }
  },
  dre: {
    index: "07 / 07", eyebrow: "DEMONSTRAÇÃO", title: "DRE simplificada", description: "Organize a formação do resultado em uma estrutura resumida.",
    fields: [{ key: "revenue", label: "Receita bruta", prefix: "R$" }, { key: "variable", label: "Custos variáveis", prefix: "R$" }, { key: "fixed", label: "Despesas fixas", prefix: "R$" }, { key: "taxes", label: "Tributos", prefix: "R$" }],
    defaults: () => ({ revenue: state.financial.revenue, variable: state.financial.variableCost, fixed: state.financial.fixedCost, taxes: getFinancialMetrics().estimatedOperationalTax }),
    calculate: v => { const contribution = v.revenue - v.variable; const result = contribution - v.fixed - v.taxes; return { value: result, formatted: money(result), interpretation: result >= 0 ? "A DRE simplificada indica resultado líquido positivo." : "A DRE simplificada indica prejuízo no período.", formula: "Resultado = Receita − Custos variáveis − Despesas fixas − Tributos", steps: [`Receita líquida de custos variáveis: ${money(v.revenue)} − ${money(v.variable)} = ${money(contribution)}.`, `Subtraia despesas fixas de ${money(v.fixed)}.`, `Subtraia tributos de ${money(v.taxes)}.`] }; }
  }
};

function showToast(message) {
  const toast = $("#toast");
  $("#toastText").textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function openApp(target = "overview") {
  $("#marketingView").hidden = true;
  $("#appView").hidden = false;
  document.body.classList.remove("modal-open");
  window.scrollTo(0, 0);
  navigateApp(target);
  renderAll();
}

function closeApp() {
  $("#appView").hidden = true;
  $("#marketingView").hidden = false;
  history.replaceState(null, "", window.location.pathname);
  window.scrollTo(0, 0);
}

function navigateApp(page) {
  if (!appMeta[page]) page = "overview";
  $$(".app-page").forEach(section => section.classList.toggle("active", section.dataset.page === page));
  $$("[data-app-page]").forEach(button => button.classList.toggle("active", button.dataset.appPage === page && button.closest(".app-nav")));
  $("#appBreadcrumb").textContent = appMeta[page][0];
  $("#appTitle").textContent = appMeta[page][1];
  $("#appSidebar").classList.remove("open");
  history.replaceState(null, "", `${window.location.pathname}?app=${page}`);
  window.scrollTo(0, 0);
  if (page === "relatorio") renderReport();
}

function getInputFinancialState() {
  const mapping = {
    revenue: "#revenueInput", variableCost: "#variableCostInput", fixedCost: "#fixedCostInput", payroll: "#payrollInput",
    initialCash: "#initialCashInput", receivables: "#receivablesInput", payables: "#payablesInput", previousRevenue: "#previousRevenueInput"
  };
  Object.entries(mapping).forEach(([key, selector]) => {
    const element = $(selector);
    if (element) state.financial[key] = Math.max(0, Number(element.value) || 0);
  });
}

function syncFinancialInputs() {
  const mapping = {
    revenue: "#revenueInput", variableCost: "#variableCostInput", fixedCost: "#fixedCostInput", payroll: "#payrollInput",
    initialCash: "#initialCashInput", receivables: "#receivablesInput", payables: "#payablesInput", previousRevenue: "#previousRevenueInput"
  };
  Object.entries(mapping).forEach(([key, selector]) => { if ($(selector)) $(selector).value = state.financial[key]; });
  if ($("#taxRevenueInput")) $("#taxRevenueInput").value = state.financial.revenue;
}

function renderOverview() {
  const m = getFinancialMetrics();
  $("#kpiRevenue").textContent = compactMoney(state.financial.revenue);
  $("#kpiExpenses").textContent = compactMoney(m.expenses);
  $("#kpiProfit").textContent = compactMoney(m.profit);
  $("#kpiProfitDetail").textContent = `Margem líquida de ${pct(m.margin)}`;
  $("#kpiCash").textContent = compactMoney(m.cash);
  $("#revenueTrend").textContent = pct(m.growth);
  $("#expenseTrend").textContent = pct(Math.max(0, m.expenseRatio - 52));
  $("#cashIn").textContent = compactMoney(state.financial.revenue);
  $("#cashOut").textContent = compactMoney(m.cashOut);
  renderPerformanceChart();
  renderCashBars();
  renderOverviewAlerts();
}

function renderPerformanceChart() {
  const svg = $("#performanceChart");
  if (!svg) return;
  const baseRevenue = state.financial.revenue;
  const baseExpenses = getFinancialMetrics().expenses;
  const revenue = [0.71, 0.76, 0.83, 0.8, 0.9, 1].map(v => baseRevenue * v);
  const expenses = [0.74, 0.78, 0.8, 0.86, 0.91, 1].map(v => baseExpenses * v);
  const all = [...revenue, ...expenses];
  const min = Math.min(...all) * .85;
  const max = Math.max(...all) * 1.08;
  const width = 730, height = 240, x0 = 15, y0 = 15;
  const point = (value, index) => [x0 + (width / 5) * index, y0 + height - ((value - min) / (max - min || 1)) * height];
  const revPoints = revenue.map(point);
  const expPoints = expenses.map(point);
  const path = points => points.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const areaPath = `${path(revPoints)} L${revPoints.at(-1)[0]},${y0 + height} L${revPoints[0][0]},${y0 + height} Z`;
  svg.innerHTML = `<defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4AF37" stop-opacity=".22"/><stop offset="1" stop-color="#D4AF37" stop-opacity="0"/></linearGradient></defs>
    ${[0,1,2,3,4].map(i => `<line class="chart-grid" x1="0" y1="${y0 + (height/4)*i}" x2="760" y2="${y0 + (height/4)*i}"/>`).join("")}
    <path class="chart-area" d="${areaPath}"/><path class="chart-line-revenue" d="${path(revPoints)}"/><path class="chart-line-expenses" d="${path(expPoints)}"/>
    ${revPoints.map((p,i) => `<circle class="chart-point" data-series="Receita" data-value="${revenue[i]}" cx="${p[0]}" cy="${p[1]}" r="4" fill="#D4AF37"/>`).join("")}
    ${expPoints.map((p,i) => `<circle class="chart-point" data-series="Despesas" data-value="${expenses[i]}" cx="${p[0]}" cy="${p[1]}" r="4" fill="#6f6f6a"/>`).join("")}`;
  $$(".chart-point", svg).forEach(circle => {
    circle.addEventListener("mouseenter", event => {
      const tooltip = $("#chartTooltip");
      tooltip.textContent = `${event.target.dataset.series}: ${compactMoney(Number(event.target.dataset.value))}`;
      tooltip.style.left = `${Math.min(620, event.target.cx.baseVal.value + 15)}px`;
      tooltip.style.top = `${event.target.cy.baseVal.value + 60}px`;
      tooltip.classList.add("visible");
    });
    circle.addEventListener("mouseleave", () => $("#chartTooltip").classList.remove("visible"));
  });
}

function renderCashBars() {
  const container = $("#cashBars");
  if (!container) return;
  const m = getFinancialMetrics();
  const patterns = [0.68, 0.78, 0.73, 0.86, 0.92, 1];
  const max = Math.max(state.financial.revenue, m.cashOut);
  container.innerHTML = patterns.map((factor, i) => `<div title="Mês ${i + 1}"><span style="height:${clamp((state.financial.revenue * factor / max) * 100, 8, 100)}%"></span><span style="height:${clamp((m.cashOut * (factor + .02 * i) / max) * 100, 8, 100)}%"></span></div>`).join("");
}

function generateAlerts() {
  const f = state.financial;
  const m = getFinancialMetrics();
  const alerts = [];
  if (m.cash < 0) alerts.push({ level: "high", title: "Fluxo de caixa negativo", explanation: `O saldo estimado é ${money(m.cash)}.`, action: "Revise prazos de recebimento, despesas imediatas e necessidade de capital com orientação profissional." });
  else if (m.cash < m.expenses * .35) alerts.push({ level: "medium", title: "Reserva de caixa reduzida", explanation: "O saldo cobre menos de 35% das despesas mensais.", action: "Acompanhe vencimentos e discuta uma reserva operacional adequada com o responsável financeiro." });
  if (m.margin < 8) alerts.push({ level: "high", title: "Margem líquida crítica", explanation: `A margem estimada está em ${pct(m.margin)}.`, action: "Revise formação de preço e estrutura de custos antes de assumir novos compromissos." });
  else if (m.margin < 18) alerts.push({ level: "medium", title: "Margem abaixo da faixa de atenção", explanation: `A margem estimada está em ${pct(m.margin)}.`, action: "Compare margem por produto ou serviço e identifique itens com menor contribuição." });
  if (m.growth < -5) alerts.push({ level: "high", title: "Receita em queda", explanation: `A receita recuou ${pct(Math.abs(m.growth))} frente ao período informado.`, action: "Investigue carteira, recorrência e sazonalidade antes de ajustar a operação." });
  else if (m.growth < 2) alerts.push({ level: "medium", title: "Receita com baixo crescimento", explanation: `A variação foi de ${pct(m.growth)}.`, action: "Acompanhe conversão comercial e retenção de clientes no próximo ciclo." });
  if (m.expenseRatio > 70) alerts.push({ level: "high", title: "Despesas pressionando a receita", explanation: `Custos e despesas consomem ${pct(m.expenseRatio)} da receita.`, action: "Classifique os gastos por impacto e revise os principais centros de custo." });
  else if (m.expenseRatio > 55) alerts.push({ level: "medium", title: "Crescimento das despesas", explanation: `Custos e despesas representam ${pct(m.expenseRatio)} da receita.`, action: "Compare fornecedores e monitore despesas variáveis para preservar margem." });
  if (f.revenue < m.breakEven * 1.15) alerts.push({ level: "medium", title: "Operação próxima do ponto de equilíbrio", explanation: `A receita está próxima do mínimo estimado de ${money(m.breakEven)}.`, action: "Evite ampliar custos fixos sem testar o impacto no ponto de equilíbrio." });
  if (alerts.length < 3) alerts.push({ level: "low", title: "Caixa em posição positiva", explanation: `O saldo estimado encerra em ${money(m.cash)}.`, action: "Mantenha projeções semanais e valide a reserva ideal para a operação." });
  if (alerts.length < 3) alerts.push({ level: "low", title: "Resultado líquido positivo", explanation: `A margem estimada é ${pct(m.margin)}.`, action: "Acompanhe a qualidade da margem por linha de receita." });
  return alerts;
}

function renderOverviewAlerts() {
  const alerts = generateAlerts();
  const top = [...alerts].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.level] - { high: 0, medium: 1, low: 2 }[b.level])).slice(0, 3);
  $("#overviewAlerts").innerHTML = top.map(a => `<div class="compact-alert"><i class="priority-${a.level}"></i><div><strong>${a.title}</strong><small>${a.explanation}</small></div><span>${a.level === "high" ? "ALTA" : a.level === "medium" ? "MÉDIA" : "OK"}</span></div>`).join("");
  $("#alertBadge").textContent = alerts.filter(a => a.level !== "low").length;
}

function renderAlerts() {
  const alerts = generateAlerts();
  const filtered = state.alertFilter === "all" ? alerts : alerts.filter(alert => alert.level === state.alertFilter);
  const labels = { high: "ALTA PRIORIDADE", medium: "ATENÇÃO MODERADA", low: "INDICADOR SAUDÁVEL" };
  $("#alertsList").innerHTML = filtered.length ? filtered.map(alert => `<article class="alert-item" data-level="${alert.level}"><div class="alert-priority-line priority-${alert.level}"></div><div class="alert-level ${alert.level}">${labels[alert.level]}</div><div class="alert-copy"><strong>${alert.title}</strong><p>${alert.explanation}</p></div><div class="alert-action"><strong>Sugestão de acompanhamento</strong><p>${alert.action}</p></div></article>`).join("") : `<div class="panel"><p>Nenhum alerta nesta prioridade.</p></div>`;
  $("#highAlertCount").textContent = alerts.filter(a => a.level === "high").length;
  $("#mediumAlertCount").textContent = alerts.filter(a => a.level === "medium").length;
  $("#healthyCount").textContent = alerts.filter(a => a.level === "low").length;
}

function calculateScore() {
  const m = getFinancialMetrics();
  const dimensions = {
    "Liquidez": clamp(Math.round(m.liquidity / 2.2 * 100), 15, 100),
    "Lucratividade": clamp(Math.round(m.margin / 30 * 100), 10, 100),
    "Fluxo de caixa": clamp(Math.round((m.cash / Math.max(m.expenses, 1)) * 100), 5, 100),
    "Crescimento": clamp(Math.round(55 + m.growth * 2.2), 5, 100),
    "Eficiência": clamp(Math.round(110 - m.expenseRatio), 5, 100),
    "Estabilidade": clamp(Math.round(45 + Math.min(m.cash / Math.max(state.financial.fixedCost, 1), 2) * 28), 5, 100)
  };
  const weights = { "Liquidez": .2, "Lucratividade": .22, "Fluxo de caixa": .2, "Crescimento": .12, "Eficiência": .14, "Estabilidade": .12 };
  const score = Math.round(Object.entries(dimensions).reduce((sum, [key, value]) => sum + value * weights[key], 0) * 10);
  let label = "Crítico", headline = "A operação exige atenção imediata.";
  if (score >= 800) { label = "Saudável"; headline = "Boa capacidade de sustentação."; }
  else if (score >= 650) { label = "Estável"; headline = "Base consistente, com pontos a acompanhar."; }
  else if (score >= 450) { label = "Atenção"; headline = "Há riscos que pedem um plano de ação."; }
  return { score, label, headline, dimensions };
}

function renderScore() {
  const result = calculateScore();
  const m = getFinancialMetrics();
  ["#scoreValue", "#scoreValueLarge"].forEach(selector => $(selector).textContent = result.score);
  $("#scoreLabel").textContent = result.label;
  $("#scoreStatusLarge").textContent = result.label.toUpperCase();
  $("#scoreHeadline").textContent = result.headline;
  $("#scoreExplanation").textContent = `A leitura combina seis dimensões. A margem está em ${pct(m.margin)}, a liquidez em ${number.format(m.liquidity)} e a variação de receita em ${pct(m.growth)}.`;
  ["#scoreGauge", "#scoreRingLarge"].forEach(selector => $(selector).style.setProperty("--score", result.score / 1000));
  $("#scoreDimensions").innerHTML = Object.entries(result.dimensions).map(([label, value]) => `<div class="dimension-row"><div><span>${label}</span><strong>${value}/100</strong></div><div class="dimension-track"><span style="width:${value}%"></span></div></div>`).join("");
  const lowest = Object.entries(result.dimensions).sort((a,b) => a[1] - b[1]).slice(0,3);
  const recommendations = {
    "Liquidez": "Revise capital de giro, recebimentos e vencimentos para ampliar a cobertura de curto prazo.",
    "Lucratividade": "Acompanhe contribuição por produto e teste ajustes de preço ou custo com base em dados.",
    "Fluxo de caixa": "Construa uma projeção semanal e reduza diferenças entre prazo de recebimento e pagamento.",
    "Crescimento": "Investigue recorrência, aquisição e ticket antes de definir novas metas comerciais.",
    "Eficiência": "Classifique despesas por centro de custo e priorize as de maior impacto sobre a margem.",
    "Estabilidade": "Estruture uma reserva operacional e acompanhe a volatilidade mensal dos resultados."
  };
  $("#scoreRecommendations").innerHTML = lowest.map(([label], i) => `<article class="recommendation-item"><span>0${i + 1}</span><strong>${label}</strong><p>${recommendations[label]}</p></article>`).join("");
}

function renderCalculator(type = state.currentCalculator) {
  state.currentCalculator = type;
  const definition = calculatorDefinitions[type];
  $("#calcIndex").textContent = definition.index;
  $("#calcEyebrow").textContent = definition.eyebrow;
  $("#calcTitle").textContent = definition.title;
  $("#calcDescription").textContent = definition.description;
  const defaults = definition.defaults();
  $("#calculatorFields").innerHTML = definition.fields.map(field => `<label class="calculator-field"><span>${field.label}</span><div class="money-field"><b>${field.prefix || field.suffix || "#"}</b><input type="number" step="0.01" data-calc-field="${field.key}" value="${Number(defaults[field.key].toFixed(2))}" /></div></label>`).join("");
  $$("[data-calc-field]").forEach(input => input.addEventListener("input", updateCalculatorResult));
  updateCalculatorResult();
  $$("[data-calculator]").forEach(button => button.classList.toggle("active", button.dataset.calculator === type));
}

function getCalculatorValues() {
  return Object.fromEntries($$("[data-calc-field]").map(input => [input.dataset.calcField, Number(input.value) || 0]));
}

function updateCalculatorResult() {
  const result = calculatorDefinitions[state.currentCalculator].calculate(getCalculatorValues());
  $("#calculatorResult").textContent = result.formatted;
  $("#calculatorInterpretation").textContent = result.interpretation;
}

function openCalculationModal(title, formula, values, steps, result, explanation) {
  $("#modalTitle").textContent = title;
  $("#modalContent").innerHTML = `
    <div class="audit-block"><p>FÓRMULA UTILIZADA</p><div class="audit-formula">${formula}</div></div>
    <div class="audit-block"><p>VALORES INFORMADOS</p><div class="audit-values">${Object.entries(values).map(([label,value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join("")}</div></div>
    <div class="audit-block"><p>ETAPAS INTERMEDIÁRIAS</p><ol class="audit-steps-modal">${steps.map(step => `<li>${step}</li>`).join("")}</ol></div>
    <div class="audit-block"><p>RESULTADO FINAL</p><div class="audit-result"><span>RESULTADO</span><strong>${result}</strong></div></div>
    <div class="audit-block"><p>LEITURA SIMPLES</p><p class="audit-explanation">${explanation}</p></div>`;
  $("#calculationModal").hidden = false;
  document.body.classList.add("modal-open");
  $(".modal-close", $("#calculationModal")).focus();
}

function closeModal(id) {
  $(id).hidden = true;
  document.body.classList.remove("modal-open");
}

const simplesTables = {
  commerce: [
    [180000, .04, 0], [360000, .073, 5940], [720000, .095, 13860], [1800000, .107, 22500], [3600000, .143, 87300], [4800000, .19, 378000]
  ],
  industry: [
    [180000, .045, 0], [360000, .078, 5940], [720000, .10, 13860], [1800000, .112, 22500], [3600000, .147, 85500], [4800000, .30, 720000]
  ],
  service3: [
    [180000, .06, 0], [360000, .112, 9360], [720000, .135, 17640], [1800000, .16, 35640], [3600000, .21, 125640], [4800000, .33, 648000]
  ],
  service5: [
    [180000, .155, 0], [360000, .18, 4500], [720000, .195, 9900], [1800000, .205, 17100], [3600000, .23, 62100], [4800000, .305, 540000]
  ]
};

function getSimplesBracket(table, rbt12) {
  const index = table.findIndex(([limit]) => rbt12 <= limit);
  const bracketIndex = index === -1 ? table.length - 1 : index;
  const [limit, nominal, deduction] = table[bracketIndex];
  const effective = rbt12 > 0 ? Math.max(0, (rbt12 * nominal - deduction) / rbt12) : nominal;
  return { bracket: bracketIndex + 1, limit, nominal, deduction, effective };
}

function calculateTax() {
  const t = state.tax;
  const factorR = t.rbt12 > 0 ? t.payroll12 / t.rbt12 : 0;
  let effective, taxes, net, label, range, nominal = 0, deduction = 0, chips;
  if (t.regime === "simples") {
    let tableKey = t.profile;
    if (t.profile === "service") tableKey = factorR >= .28 ? "service3" : "service5";
    const bracket = getSimplesBracket(simplesTables[tableKey], t.rbt12);
    effective = bracket.effective;
    nominal = bracket.nominal;
    deduction = bracket.deduction;
    taxes = t.revenue * effective;
    net = t.revenue - taxes;
    label = "Simples Nacional";
    range = `Faixa ${bracket.bracket} · hipótese ${tableKey === "service3" ? "Anexo III" : tableKey === "service5" ? "Anexo V" : t.profile === "commerce" ? "Anexo I" : "Anexo II"}`;
    chips = t.profile === "service" ? ["IRPJ","CSLL","PIS","COFINS","CPP","ISS"] : ["IRPJ","CSLL","PIS","COFINS","CPP", t.profile === "industry" ? "IPI" : "ICMS"];
  } else {
    const rates = t.profile === "service" ? { federal: .1133, local: .05 } : t.profile === "industry" ? { federal: .0673, local: .01 } : { federal: .0593, local: .0 };
    effective = rates.federal + rates.local;
    taxes = t.revenue * effective;
    net = t.revenue - taxes;
    label = "Lucro Presumido";
    range = "Hipótese trimestral simplificada";
    nominal = effective;
    chips = t.profile === "service" ? ["IRPJ","CSLL","PIS","COFINS","ISS"] : ["IRPJ","CSLL","PIS","COFINS", t.profile === "industry" ? "IPI" : "ICMS não incluído"];
  }
  state.tax.result = { effective, taxes, net, label, range, factorR, nominal, deduction, chips };
  return state.tax.result;
}

function syncTaxState() {
  state.tax.revenue = Math.max(0, Number($("#taxRevenueInput").value) || 0);
  state.tax.rbt12 = Math.max(0, Number($("#taxRbt12Input").value) || 0);
  state.tax.payroll12 = Math.max(0, Number($("#taxPayroll12Input").value) || 0);
  state.tax.profile = $("#activityProfile").value;
}

function renderTax() {
  const r = calculateTax();
  $("#taxResultRegime").textContent = r.label;
  $("#taxRange").textContent = r.range;
  $("#taxEffectiveRate").textContent = pct(r.effective * 100);
  $("#taxGross").textContent = money(state.tax.revenue);
  $("#taxEstimated").textContent = money(r.taxes);
  $("#taxNet").textContent = money(r.net);
  $("#taxFactorR").textContent = state.tax.profile === "service" ? pct(r.factorR * 100) : "Não aplicável";
  $("#taxChips").innerHTML = r.chips.map(chip => `<span>${chip}</span>`).join("");
  $("#taxRegimeLabel").textContent = r.label;
  $("#taxRateOverview").textContent = pct(r.effective * 100);
  $("#taxAmountOverview").textContent = money(r.taxes);
  $$("[data-tax-regime]").forEach(button => button.classList.toggle("active", button.dataset.taxRegime === state.tax.regime));
}

function openTaxSteps() {
  const r = state.tax.result || calculateTax();
  const values = {
    "Regime": r.label,
    "Receita mensal": money(state.tax.revenue),
    "RBT12": money(state.tax.rbt12),
    "Folha 12 meses": money(state.tax.payroll12),
    "Fator R": pct(r.factorR * 100),
    "Alíquota nominal da hipótese": pct(r.nominal * 100),
    "Parcela a deduzir": money(r.deduction)
  };
  const steps = state.tax.regime === "simples" ? [
    `Identifique a faixa usando a receita bruta acumulada de ${money(state.tax.rbt12)}.`,
    `Calcule a alíquota efetiva: [(RBT12 × ${pct(r.nominal * 100)}) − ${money(r.deduction)}] ÷ RBT12.`,
    `Aplique ${pct(r.effective * 100)} à receita mensal de ${money(state.tax.revenue)}.`
  ] : [
    `Use uma hipótese agregada de ${pct(r.effective * 100)} para os tributos indicados.`,
    `Multiplique a receita mensal de ${money(state.tax.revenue)} pela alíquota agregada.`,
    `Subtraia a estimativa da receita para obter o valor líquido aproximado.`
  ];
  openCalculationModal("Memória da simulação tributária", state.tax.regime === "simples" ? "Alíquota efetiva = [(RBT12 × Alíquota nominal) − Parcela a deduzir] ÷ RBT12" : "Tributos estimados = Receita × Alíquota agregada da hipótese", values, steps, money(r.taxes), "Esta é uma estimativa educacional baseada em hipóteses simplificadas. Atividade, anexo, retenções, benefícios, sublimites, tributos estaduais ou municipais e regras vigentes podem alterar substancialmente o resultado. Consulte um contador ou profissional tributário qualificado.");
}

function renderReport() {
  const m = getFinancialMetrics();
  const score = calculateScore();
  const tax = state.tax.result || calculateTax();
  const alerts = generateAlerts().filter(a => a.level !== "low").slice(0,3);
  const date = new Date();
  const dateLong = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase().replace(".", "");
  $("#reportDate").textContent = dateLong;
  $("#reportFooterDate").textContent = `Gerado em ${date.toLocaleDateString("pt-BR")}`;
  $("#reportRevenue").textContent = compactMoney(state.financial.revenue);
  $("#reportProfit").textContent = compactMoney(m.profit);
  $("#reportMargin").textContent = pct(m.margin);
  $("#reportScore").textContent = `${score.score} / 1000`;
  $("#reportGross").textContent = money(state.financial.revenue);
  $("#reportCosts").textContent = money(m.expenses);
  $("#reportNetProfit").textContent = money(m.profit);
  $("#reportScoreTitle").textContent = `Score ${score.label.toLowerCase()}: ${score.score}`;
  $("#reportSummary").textContent = `A operação apresenta ${m.profit >= 0 ? "resultado positivo" : "resultado negativo"} e margem de ${pct(m.margin)}. Custos e despesas representam ${pct(m.expenseRatio)} da receita, enquanto o caixa estimado encerra em ${money(m.cash)}.`;
  $("#reportAlerts").innerHTML = alerts.length ? alerts.map(a => `<p>${a.title}: ${a.explanation}</p>`).join("") : "<p>Sem alertas prioritários no cenário atual.</p>";
  $("#reportTaxRegime").textContent = tax.label;
  $("#reportTaxRate").textContent = pct(tax.effective * 100);
  $("#reportTaxAmount").textContent = money(tax.taxes);
  $("#reportTaxNet").textContent = money(tax.net);
}

function renderAll() {
  renderOverview();
  renderAlerts();
  renderScore();
  renderTax();
  renderReport();
  if ($("[data-page='calculadoras']").classList.contains("active")) renderCalculator();
}

function bindEvents() {
  window.addEventListener("scroll", () => $("#siteHeader").classList.toggle("scrolled", window.scrollY > 30), { passive: true });
  $("#menuButton").addEventListener("click", () => {
    const open = $("#mobileNav").classList.toggle("open");
    $("#menuButton").setAttribute("aria-expanded", String(open));
  });
  $$("#mobileNav a").forEach(link => link.addEventListener("click", () => $("#mobileNav").classList.remove("open")));
  $$('[data-open-app]').forEach(button => button.addEventListener("click", event => openApp(event.currentTarget.dataset.appTarget || "overview")));
  $$('[data-close-app]').forEach(button => button.addEventListener("click", event => { event.preventDefault(); closeApp(); }));
  $$('[data-app-page]').forEach(button => button.addEventListener("click", () => navigateApp(button.dataset.appPage)));
  $('[data-open-sidebar]').addEventListener("click", () => $("#appSidebar").classList.add("open"));
  $('[data-close-sidebar]').addEventListener("click", () => $("#appSidebar").classList.remove("open"));
  $("#financeForm").addEventListener("input", () => { getInputFinancialState(); state.tax.revenue = state.financial.revenue; $("#taxRevenueInput").value = state.financial.revenue; renderAll(); });
  $("#loadExample").addEventListener("click", () => { state.financial = { ...exampleData }; syncFinancialInputs(); renderAll(); showToast("Valores demonstrativos restaurados."); });
  $$("[data-calculator]").forEach(button => button.addEventListener("click", () => renderCalculator(button.dataset.calculator)));
  $("#viewCalculatorSteps").addEventListener("click", () => {
    const def = calculatorDefinitions[state.currentCalculator];
    const values = getCalculatorValues();
    const result = def.calculate(values);
    const labels = Object.fromEntries(def.fields.map(field => [field.label, field.suffix === "%" ? pct(values[field.key]) : money(values[field.key])]));
    openCalculationModal(def.title, result.formula, labels, result.steps, result.formatted, result.interpretation);
  });
  $$('[data-tax-regime]').forEach(button => button.addEventListener("click", () => { state.tax.regime = button.dataset.taxRegime; renderTax(); }));
  $("#recalculateTax").addEventListener("click", () => { syncTaxState(); renderTax(); renderReport(); showToast("Estimativa tributária recalculada."); });
  $("#viewTaxSteps").addEventListener("click", openTaxSteps);
  $$('[data-alert-filter]').forEach(button => button.addEventListener("click", () => { state.alertFilter = button.dataset.alertFilter; $$('[data-alert-filter]').forEach(item => item.classList.toggle("active", item === button)); renderAlerts(); }));
  $$('[data-print-report]').forEach(button => button.addEventListener("click", () => { renderReport(); window.print(); }));
  $$('[data-close-modal]').forEach(button => button.addEventListener("click", () => closeModal("#calculationModal")));
  $("#calculationModal").addEventListener("click", event => { if (event.target.id === "calculationModal") closeModal("#calculationModal"); });
  $("#legalModal").addEventListener("click", event => { if (event.target.id === "legalModal") closeModal("#legalModal"); });
  $$('[data-close-legal]').forEach(button => button.addEventListener("click", () => closeModal("#legalModal")));
  $$('[data-demo-calculation]').forEach(button => button.addEventListener("click", () => openCalculationModal("Margem líquida demonstrativa", "Margem = (Lucro líquido ÷ Receita total) × 100", { "Receita total": "R$ 128.400,00", "Lucro líquido": "R$ 38.520,00" }, ["Divida R$ 38.520,00 por R$ 128.400,00.", "O quociente é 0,30.", "Multiplique por 100 para converter em percentual."], "30,00%", "A cada R$ 100 faturados, R$ 30 permanecem como resultado líquido no cenário demonstrado.")));
  $$('[data-calc]').forEach(button => button.addEventListener("click", () => {
    if (button.dataset.calc === "cashflow") {
      const def = calculatorDefinitions.cashflow; const values = def.defaults(); const result = def.calculate(values);
      openCalculationModal(def.title, result.formula, { "Saldo inicial": money(values.initial), "Entradas": money(values.inflow), "Saídas": money(values.outflow) }, result.steps, result.formatted, result.interpretation);
    } else {
      const score = calculateScore();
      openCalculationModal("Composição do score financeiro", "Score = média ponderada das seis dimensões × 10", Object.fromEntries(Object.entries(score.dimensions).map(([k,v]) => [k, `${v}/100`])), ["Normalize liquidez e cobertura de curto prazo.", "Avalie lucratividade e geração de caixa.", "Considere crescimento, eficiência e estabilidade.", "Aplique pesos definidos e converta a média para a escala de 0 a 1000."], `${score.score} / 1000`, "O score é uma leitura gerencial demonstrativa. Ele não representa rating de crédito, recomendação de investimento ou diagnóstico profissional.");
    }
  }));
  $$('[data-coming-soon]').forEach(element => element.addEventListener("click", event => { event.preventDefault(); showToast("Funcionalidade preparada para uma versão futura."); }));
  $$('[data-legal]').forEach(button => button.addEventListener("click", () => {
    const privacy = button.dataset.legal === "privacidade";
    $("#legalTitle").textContent = privacy ? "Política de Privacidade" : "Termos de Uso";
    $("#legalContent").innerHTML = privacy ? `<h3>Dados nesta demonstração</h3><p>Os valores informados são processados apenas no navegador e não são enviados a banco de dados. A versão comercial deverá apresentar política completa, base legal, prazos de retenção, direitos do titular e canais de atendimento antes do lançamento.</p><h3>Cookies e métricas</h3><p>A hospedagem pode coletar métricas técnicas de navegação. Nenhum dado financeiro informado nos formulários é utilizado para criar conta ou histórico nesta versão.</p>` : `<h3>Natureza da ferramenta</h3><p>O Kawr Business é uma ferramenta de apoio gerencial. Não substitui contador, advogado, consultor tributário ou assessor financeiro. Resultados tributários são estimativas educacionais.</p><h3>Uso da demonstração</h3><p>Não utilize os resultados para arquivar declarações, escolher enquadramento ou tomar decisões relevantes sem validação de profissional qualificado.</p>`;
    $("#legalModal").hidden = false; document.body.classList.add("modal-open");
  }));
  document.addEventListener("keydown", event => { if (event.key === "Escape") { if (!$("#calculationModal").hidden) closeModal("#calculationModal"); if (!$("#legalModal").hidden) closeModal("#legalModal"); } });
}

syncFinancialInputs();
bindEvents();
renderCalculator();
renderAll();

const initialAppPage = new URLSearchParams(window.location.search).get("app");
if (initialAppPage && appMeta[initialAppPage]) openApp(initialAppPage);
