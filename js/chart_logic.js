// js/chart_logic.js
let chartInstance = null;


function wrapLabels(label, maxWidth) {
    const lang = currentLanguage || 'de';
    const originalLabel = (typeof label === 'object' && label !== null && label[lang]) ? label[lang] : String(label);

    if (typeof originalLabel !== 'string') {
        if (Array.isArray(originalLabel)) return originalLabel;
        return [String(originalLabel)];
    }
    const words = originalLabel.split(' ');
    let lines = [];
    let currentLine = '';
    for (const word of words) {
        if ((currentLine + word).length > maxWidth && currentLine.length > 0) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    }
    lines.push(currentLine.trim());
    return lines;
}

const tooltipTitleCallback = (tooltipItems) => {
    const item = tooltipItems[0];
    let label = item.chart.data.labels[item.dataIndex];
    if (Array.isArray(label)) {
        return label.join(' ');
    }
    // const currentTrans = translations[currentLanguage]; // Already handled if labels are pre-translated
    return label;
};

function getChartConfig() {
    const currentTrans = translations[currentLanguage];
    const isDarkMode = document.documentElement.classList.contains('dark');

    // Definiere Farben für Light und Dark Mode
    const titleColor = isDarkMode ? '#60a5fa' : '#0056B3'; // Sky-400 : Blue-700
    const tickColor = isDarkMode ? '#94a3b8' : '#0056B3';  // Slate-400 : Blue-700
    const gridColor = isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(0, 86, 179, 0.15)'; // Slate-600 mit Alpha : Blue-700 mit Alpha
    const dataset1BG = isDarkMode ? 'rgba(59, 130, 246, 0.7)' : 'rgba(0, 123, 255, 0.7)'; // Blue-500 : Original Blue
    const dataset1Border = isDarkMode ? '#3b82f6' : '#007BFF';
    const dataset2BG = isDarkMode ? 'rgba(234, 179, 8, 0.7)' : 'rgba(255, 193, 7, 0.7)'; // Yellow-500 : Original Yellow
    const dataset2Border = isDarkMode ? '#eab308' : '#ffc107';


    const chartLabels = [ //
        currentTrans.chart_mcVsTd_label_bias,
        currentTrans.chart_mcVsTd_label_variance,
        wrapLabels(currentTrans.chart_mcVsTd_label_updateFreq, 16),
        wrapLabels(currentTrans.chart_mcVsTd_label_incompleteEp, 16),
        wrapLabels(currentTrans.chart_mcVsTd_label_initSens, 16)
    ];

    return {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: currentTrans.chart_mcVsTd_dataset_mc,
                data: [1, 5, 1, 1, 1],
                backgroundColor: dataset1BG,
                borderColor: dataset1Border,
                borderWidth: 1
            }, {
                label: currentTrans.chart_mcVsTd_dataset_td,
                data: [3, 2, 5, 5, 4],
                backgroundColor: dataset2BG,
                borderColor: dataset2Border,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: currentTrans.chart_mcVsTd_title,
                    font: { size: 18, weight: 'bold' },
                    padding: { top: 10, bottom: 20 },
                    color: titleColor
                },
                tooltip: {
                    backgroundColor: isDarkMode ? '#334155' : '#fff', // Slate-600 : White
                    titleColor: isDarkMode ? '#f1f5f9' : '#333',    // Slate-100 : Dark Gray
                    bodyColor: isDarkMode ? '#cbd5e1' : '#555',     // Slate-300 : Medium Gray
                    borderColor: isDarkMode ? '#475569' : '#ddd',    // Slate-500 : Light Gray
                    borderWidth: 1,
                    callbacks: { //
                        title: tooltipTitleCallback,
                        label: function(context) { //
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const characteristicIndex = context.dataIndex;
                            const datasetLabel = context.dataset.label;
                            const currentTransTooltip = translations[currentLanguage];

                            if (datasetLabel === currentTransTooltip.chart_mcVsTd_dataset_mc) {
                                if (characteristicIndex === 0) label += currentTransTooltip.tooltip_bias_low_mc;
                                else if (characteristicIndex === 1) label += currentTransTooltip.tooltip_variance_high_mc;
                                else if (characteristicIndex === 2) label += currentTransTooltip.tooltip_update_episode_mc;
                                else if (characteristicIndex === 3) label += currentTransTooltip.tooltip_incomplete_no_mc;
                                else if (characteristicIndex === 4) label += currentTransTooltip.tooltip_init_insensitive_mc;
                            } else if (datasetLabel === currentTransTooltip.chart_mcVsTd_dataset_td) {
                                if (characteristicIndex === 0) label += currentTransTooltip.tooltip_bias_medium_td;
                                else if (characteristicIndex === 1) label += currentTransTooltip.tooltip_variance_low_td;
                                else if (characteristicIndex === 2) label += currentTransTooltip.tooltip_update_step_td;
                                else if (characteristicIndex === 3) label += currentTransTooltip.tooltip_incomplete_yes_td;
                                else if (characteristicIndex === 4) label += currentTransTooltip.tooltip_init_sensitive_td;
                            } else {
                                label += context.raw;
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5.5,
                    ticks: {
                        stepSize: 1,
                        callback: function(value) {
                            const currentTransTicks = translations[currentLanguage];
                            switch(value) {
                                case 1: return currentTransTicks.chart_mcVsTd_yAxis_lowNo;
                                case 3: return currentTransTicks.chart_mcVsTd_yAxis_medium;
                                case 5: return currentTransTicks.chart_mcVsTd_yAxis_highYes;
                                default: return value === 0 || value === 2 || value === 4 ? String(value) : '';
                            }
                        },
                        color: tickColor,
                        font: { weight: '600'}
                    },
                    grid: {
                        color: gridColor
                    }
                },
                x: {
                     ticks: { color: tickColor, font: { weight: '600'}},
                     grid: { display: false }
                }
            },
            animation: {
                duration: 700, // Etwas schneller für ein "snappy" Gefühl
                easing: 'easeOutQuart' // Sanfteres Easing
            }
        }
    }
};

function updateChartLanguage() { //
    if (chartInstance) {
        const config = getChartConfig(); //
        chartInstance.data.labels = config.data.labels; //
        chartInstance.data.datasets[0].label = config.data.datasets[0].label; //
        chartInstance.data.datasets[1].label = config.data.datasets[1].label; //
        chartInstance.options.plugins.title.text = config.options.plugins.title.text; //
        
        // Update colors based on current theme by re-applying options
        chartInstance.options.plugins.title.color = config.options.plugins.title.color;
        chartInstance.options.plugins.tooltip.backgroundColor = config.options.plugins.tooltip.backgroundColor;
        chartInstance.options.plugins.tooltip.titleColor = config.options.plugins.tooltip.titleColor;
        chartInstance.options.plugins.tooltip.bodyColor = config.options.plugins.tooltip.bodyColor;
        chartInstance.options.plugins.tooltip.borderColor = config.options.plugins.tooltip.borderColor;
        chartInstance.options.scales.y.ticks.color = config.options.scales.y.ticks.color;
        chartInstance.options.scales.y.grid.color = config.options.scales.y.grid.color;
        chartInstance.options.scales.x.ticks.color = config.options.scales.x.ticks.color;
        chartInstance.data.datasets[0].backgroundColor = config.data.datasets[0].backgroundColor;
        chartInstance.data.datasets[0].borderColor = config.data.datasets[0].borderColor;
        chartInstance.data.datasets[1].backgroundColor = config.data.datasets[1].backgroundColor;
        chartInstance.data.datasets[1].borderColor = config.data.datasets[1].borderColor;

        chartInstance.update(); //
    }
}

function initializeChart() { //
    const mcVsTdCtx = document.getElementById('mcVsTdChart');
    if (mcVsTdCtx) {
        chartInstance = new Chart(mcVsTdCtx.getContext('2d'), getChartConfig()); //
    }
}
