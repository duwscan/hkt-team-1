import url from 'url';
import { createRunner } from '@puppeteer/replay';

export async function run(extension, page) {
    // Call extension before all steps
    if (extension && typeof extension.beforeAllSteps === 'function') {
        await extension.beforeAllSteps();
    }

    const runner = await createRunner(extension);

    // Step 1: Set viewport
    console.log('📱 Step 1: Setting viewport to 1097x934...');
    await page.evaluate((stepNum) => {
        if (window.showStepIndicator) {
            window.showStepIndicator(stepNum, 'Setting viewport to 1097x934');
        }
    }, 1);
    
    await runner.runStep({
        type: 'setViewport',
        width: 1097,
        height: 934,
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        isLandscape: false
    });
    console.log('✅ Viewport set to 1097x934 successfully');
    
    // Wait a bit to see the change
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: Navigate
    console.log('🌐 Step 2: Navigating to recruit page...');
    await page.evaluate((stepNum) => {
        if (window.showStepIndicator) {
            window.showStepIndicator(stepNum, 'Navigating to recruit page');
        }
    }, 2);
    
    await runner.runStep({
        type: 'navigate',
        url: 'https://yopaz.vn/recruit/#',
        assertedEvents: [
            {
                type: 'navigation',
                url: 'https://yopaz.vn/recruit/#',
                title: 'Công ty TNHH YOPAZ | Tuyển dụng'
            }
        ]
    });
    
    // Wait for navigation to complete
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Click on top section
    console.log('🖱️ Step 3: Clicking on top section (offset: 366, 106)...');
    await page.evaluate((stepNum) => {
        if (window.showStepIndicator) {
            window.showStepIndicator(stepNum, 'Clicking on top section');
        }
    }, 3);
    
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'div.c_top > div > div'
            ],
            [
                'xpath///*[@id="main"]/div[2]/section[2]/div[1]/div/div'
            ],
            [
                'pierce/div.c_top > div > div'
            ]
        ],
        offsetY: 106,
        offsetX: 366,
    });
    console.log('✅ Click completed at position (366, 106)');
    
    // Wait to see the click effect
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 4: Click on page 3 navigation
    console.log('📄 Step 4: Clicking on page 3 navigation (offset: 25.64, 37.61)...');
    await page.evaluate((stepNum) => {
        if (window.showStepIndicator) {
            window.showStepIndicator(stepNum, 'Clicking on page 3 navigation');
        }
    }, 4);
    
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/2'
            ],
            [
                'div.recruit-page li:nth-of-type(3) > a'
            ],
            [
                'xpath///*[@id="data_table"]/div[2]/nav/ul/li[3]/a'
            ],
            [
                'pierce/div.recruit-page li:nth-of-type(3) > a'
            ]
        ],
        offsetY: 37.609375,
        offsetX: 25.640625,
        assertedEvents: [
            {
                type: 'navigation'
            }
        ]
    });
    console.log('✅ Navigation to page 3 completed');
    
    // Wait to see the navigation effect
    await new Promise(resolve => setTimeout(resolve, 3000));
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/3'
            ],
            [
                'div.recruit-page li:nth-of-type(4) > a'
            ],
            [
                'xpath///*[@id="data_table"]/div[2]/nav/ul/li[4]/a'
            ],
            [
                'pierce/div.recruit-page li:nth-of-type(4) > a'
            ]
        ],
        offsetY: 25.609375,
        offsetX: 44.65625,
        assertedEvents: [
            {
                type: 'navigation',
                url: 'https://yopaz.vn/recruit/?page=3',
                title: ''
            }
        ]
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'li:nth-of-type(6)'
            ],
            [
                'xpath///*[@id="data_table"]/div[2]/nav/ul/li[6]'
            ],
            [
                'pierce/li:nth-of-type(6)'
            ]
        ],
        offsetY: 24.609375,
        offsetX: 2.578125,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/8'
            ],
            [
                'li:nth-of-type(9) > a'
            ],
            [
                'xpath///*[@id="data_table"]/div[2]/nav/ul/li[9]/a'
            ],
            [
                'pierce/li:nth-of-type(9) > a'
            ]
        ],
        offsetY: 21.609375,
        offsetX: 38.28125,
        assertedEvents: [
            {
                type: 'navigation',
                url: 'https://yopaz.vn/recruit/?page=8',
                title: ''
            }
        ]
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                '#rec1'
            ],
            [
                'xpath///*[@id="rec1"]'
            ],
            [
                'pierce/#rec1'
            ]
        ],
        offsetY: 16,
        offsetX: 183,
    });
    await runner.runStep({
        type: 'change',
        value: 'Web development',
        selectors: [
            [
                '#rec1'
            ],
            [
                'xpath///*[@id="rec1"]'
            ],
            [
                'pierce/#rec1'
            ]
        ],
        target: 'main'
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/Tìm kiếm'
            ],
            [
                'div.c_top a'
            ],
            [
                'xpath///*[@id="main"]/div[2]/section[2]/div[1]/div/div/div[2]/a'
            ],
            [
                'pierce/div.c_top a'
            ],
            [
                'text/Tìm kiếm'
            ]
        ],
        offsetY: 25,
        offsetX: 59.484375,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'div.list-item > div:nth-of-type(1) div.submit-recruit a'
            ],
            [
                'xpath///*[@id="data_table"]/div[1]/div[1]/div[2]/div[2]/div[2]/a'
            ],
            [
                'pierce/div.list-item > div:nth-of-type(1) div.submit-recruit a'
            ]
        ],
        offsetY: 39.609375,
        offsetX: 69.609375,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                '#name_cv1'
            ],
            [
                'xpath///*[@id="name_cv1"]'
            ],
            [
                'pierce/#name_cv1'
            ]
        ],
        offsetY: 28.59375,
        offsetX: 135.5,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                '#modal-cv'
            ],
            [
                'xpath///*[@id="modal-cv"]'
            ],
            [
                'pierce/#modal-cv'
            ]
        ],
        offsetY: 439,
        offsetX: 91,
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/VỀ CHÚNG TÔI'
            ],
            [
                '#navbarText > ul > li:nth-of-type(2) > a'
            ],
            [
                'xpath///*[@id="navbarText"]/ul/li[2]/a'
            ],
            [
                'pierce/#navbarText > ul > li:nth-of-type(2) > a'
            ],
            [
                'text/VỀ CHÚNG TÔI'
            ]
        ],
        offsetY: 22.5,
        offsetX: 80.234375,
        assertedEvents: [
            {
                type: 'navigation',
                url: 'https://yopaz.vn/about-us/',
                title: ''
            }
        ]
    });
    await runner.runStep({
        type: 'click',
        target: 'main',
        selectors: [
            [
                'aria/DỊCH VỤ'
            ],
            [
                '#navbarText > ul > li:nth-of-type(3) > a'
            ],
            [
                'xpath///*[@id="navbarText"]/ul/li[3]/a'
            ],
            [
                'pierce/#navbarText > ul > li:nth-of-type(3) > a'
            ],
            [
                'text/DỊCH VỤ'
            ]
        ],
        offsetY: 32.5,
        offsetX: 41.109375,
        assertedEvents: [
            {
                type: 'navigation',
                url: 'https://yopaz.vn/service/',
                title: ''
            }
        ]
    });

    await runner.runAfterAllSteps();
}

if (process && process.argv && process.argv[1] && import.meta.url === url.pathToFileURL(process.argv[1]).href) {
    run()
}
