'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">enterprise-analytics documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search">
    <input type="text" placeholder="Type to search">
    <button type="button"
        class="search-input-clear"
        aria-label="Clear search"
        data-search-input-clear>&times;</button>
</div>
` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="architecture.html" data-type="chapter-link">
                                        <span class="icon ion-ios-git-branch"></span>Architecture
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-e71c4c1ea852f51a490e0520645fae306d70a20c94063079cb5caef7f73ac5632f99435d7ca9a4a1be68a06046b0556ab042531645b7c632f16b310946c8f2b4"' : 'data-bs-target="#xs-components-links-module-AppModule-e71c4c1ea852f51a490e0520645fae306d70a20c94063079cb5caef7f73ac5632f99435d7ca9a4a1be68a06046b0556ab042531645b7c632f16b310946c8f2b4"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-e71c4c1ea852f51a490e0520645fae306d70a20c94063079cb5caef7f73ac5632f99435d7ca9a4a1be68a06046b0556ab042531645b7c632f16b310946c8f2b4"' :
                                            'id="xs-components-links-module-AppModule-e71c4c1ea852f51a490e0520645fae306d70a20c94063079cb5caef7f73ac5632f99435d7ca9a4a1be68a06046b0556ab042531645b7c632f16b310946c8f2b4"' }>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/ChartCardComponent.html" data-type="entity-link" >ChartCardComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ConfirmDialogComponent.html" data-type="entity-link" >ConfirmDialogComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardPage.html" data-type="entity-link" >DashboardPage</a>
                            </li>
                            <li class="link">
                                <a href="components/DataTableComponent.html" data-type="entity-link" >DataTableComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HelpCenterPage.html" data-type="entity-link" >HelpCenterPage</a>
                            </li>
                            <li class="link">
                                <a href="components/KpiWidgetComponent.html" data-type="entity-link" >KpiWidgetComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoadingSkeletonComponent.html" data-type="entity-link" >LoadingSkeletonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LoginPage.html" data-type="entity-link" >LoginPage</a>
                            </li>
                            <li class="link">
                                <a href="components/ProfilePage.html" data-type="entity-link" >ProfilePage</a>
                            </li>
                            <li class="link">
                                <a href="components/RecordFormModalComponent.html" data-type="entity-link" >RecordFormModalComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RecordListPage.html" data-type="entity-link" >RecordListPage</a>
                            </li>
                            <li class="link">
                                <a href="components/RegisterPage.html" data-type="entity-link" >RegisterPage</a>
                            </li>
                            <li class="link">
                                <a href="components/ReportViewerPage.html" data-type="entity-link" >ReportViewerPage</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/HighlightDirective.html" data-type="entity-link" >HighlightDirective</a>
                                </li>
                            </ul>
                        </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AccessibilityService.html" data-type="entity-link" >AccessibilityService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ApiRestService.html" data-type="entity-link" >ApiRestService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthEffects.html" data-type="entity-link" >AuthEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DataEffects.html" data-type="entity-link" >DataEffects</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExportService.html" data-type="entity-link" >ExportService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FirestoreMockService.html" data-type="entity-link" >FirestoreMockService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/authGuard.html" data-type="entity-link" >authGuard</a>
                            </li>
                            <li class="link">
                                <a href="guards/roleGuard.html" data-type="entity-link" >roleGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AccessibilityPreferences.html" data-type="entity-link" >AccessibilityPreferences</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppState.html" data-type="entity-link" >AppState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthResponse.html" data-type="entity-link" >AuthResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AuthState.html" data-type="entity-link" >AuthState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryDistribution.html" data-type="entity-link" >CategoryDistribution</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CategoryReportSummary.html" data-type="entity-link" >CategoryReportSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartDataPoint.html" data-type="entity-link" >ChartDataPoint</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ChartSeries.html" data-type="entity-link" >ChartSeries</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardSummary.html" data-type="entity-link" >DashboardSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DataState.html" data-type="entity-link" >DataState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Kpi.html" data-type="entity-link" >Kpi</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginCredentials.html" data-type="entity-link" >LoginCredentials</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MockUserData.html" data-type="entity-link" >MockUserData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NavigationItem.html" data-type="entity-link" >NavigationItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaginatedRecords.html" data-type="entity-link" >PaginatedRecords</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Record.html" data-type="entity-link" >Record</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RecordFilters.html" data-type="entity-link" >RecordFilters</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RegisterData.html" data-type="entity-link" >RegisterData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportMetrics.html" data-type="entity-link" >ReportMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableAction.html" data-type="entity-link" >TableAction&lt;T &#x3D; any&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableActionEvent.html" data-type="entity-link" >TableActionEvent&lt;T &#x3D; any&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TableColumn.html" data-type="entity-link" >TableColumn&lt;T &#x3D; any&gt;</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimelineChartData.html" data-type="entity-link" >TimelineChartData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/User.html" data-type="entity-link" >User</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-funnel"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/CurrencyFormatPipe.html" data-type="entity-link" >CurrencyFormatPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/RelativeTimePipe.html" data-type="entity-link" >RelativeTimePipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
