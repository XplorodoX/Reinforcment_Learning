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
    const chartLabels = [
        currentTrans.chart_mcVsTd_label_bias,
        currentTrans.chart_mcVsTd_label_variance,
        wrapLabels(currentTrans.chart_mcVsTd_label_updateFreq, 16), // wrapLabels will pick up currentTrans itself if needed
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
                backgroundColor: 'rgba(0, 123, 255, 0.7)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 1
            }, {
                label: currentTrans.chart_mcVsTd_dataset_td,
                data: [3, 2, 5, 5, 4],
                backgroundColor: 'rgba(255, 193, 7, 0.7)',
                borderColor: 'rgba(255, 193, 7, 1)',
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
                    color: '#0056B3'
                },
                tooltip: {
                    callbacks: {
                        title: tooltipTitleCallback,
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const characteristicIndex = context.dataIndex;
                            const datasetLabel = context.dataset.label;
                            const currentTransTooltip = translations[currentLanguage]; // Ensure this is the correct lang

                            if (datasetLabel === currentTransTooltip.chart_mcVsTd_dataset_mc) { // MC
                                if (characteristicIndex === 0) label += currentTransTooltip.tooltip_bias_low_mc;
                                else if (characteristicIndex === 1) label += currentTransTooltip.tooltip_variance_high_mc;
                                else if (characteristicIndex === 2) label += currentTransTooltip.tooltip_update_episode_mc;
                                else if (characteristicIndex === 3) label += currentTransTooltip.tooltip_incomplete_no_mc;
                                else if (characteristicIndex === 4) label += currentTransTooltip.tooltip_init_insensitive_mc;
                            } else if (datasetLabel === currentTransTooltip.chart_mcVsTd_dataset_td) { // TD
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
                            const currentTransTicks = translations[currentLanguage]; // Ensure this is the correct lang
                            switch(value) {
                                case 1: return currentTransTicks.chart_mcVsTd_yAxis_lowNo;
                                case 3: return currentTransTicks.chart_mcVsTd_yAxis_medium;
                                case 5: return currentTransTicks.chart_mcVsTd_yAxis_highYes;
                                default: return value === 0 || value === 2 || value === 4 ? String(value) : '';
                            }
                        },
                        color: '#0056B3',
                        font: { weight: '600'}
                    },
                    grid: {
                        color: 'rgba(0, 86, 179, 0.15)'
                    }
                },
                x: {
                     ticks: { color: '#0056B3', font: { weight: '600'}},
                     grid: { display: false }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    }
};

function updateChartLanguage() {
    if (chartInstance) {
        const config = getChartConfig();
        chartInstance.data.labels = config.data.labels;
        chartInstance.data.datasets[0].label = config.data.datasets[0].label;
        chartInstance.data.datasets[1].label = config.data.datasets[1].label;
        chartInstance.options.plugins.title.text = config.options.plugins.title.text;
        // The callbacks for tooltips and y-axis ticks will use the global 'currentLanguage'
        // and 'translations' object, so they should update dynamically as well if 'currentLanguage' changes.
        chartInstance.update();
    }
}

function initializeChart() {
    const mcVsTdCtx = document.getElementById('mcVsTdChart');
    if (mcVsTdCtx) {
        chartInstance = new Chart(mcVsTdCtx.getContext('2d'), getChartConfig());
    }
}
