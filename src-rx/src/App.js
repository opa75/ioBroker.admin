import React, { Suspense } from 'react';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/core/styles';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import clsx from 'clsx';

// @material-ui/core
import AppBar from '@material-ui/core/AppBar';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Hidden, Tooltip } from '@material-ui/core';
import Badge from '@material-ui/core/Badge';

// @material-ui/icons
import MenuIcon from '@material-ui/icons/Menu';
import BuildIcon from '@material-ui/icons/Build';
import VisibilityIcon from '@material-ui/icons/Visibility';
import PictureInPictureAltIcon from '@material-ui/icons/PictureInPictureAlt';
import UserIcon from '@material-ui/icons/Person';

import ExpertIcon from '@iobroker/adapter-react/icons/IconExpert';

import { AdminConnection as Connection, PROGRESS } from '@iobroker/socket-client';
import Loader from '@iobroker/adapter-react/Components/Loader';
import LoaderPT from '@iobroker/adapter-react/Components/Loaders/PT';
import LoaderVendor from '@iobroker/adapter-react/Components/Loaders/Vendor';
import I18n from '@iobroker/adapter-react/i18n';
import Router from '@iobroker/adapter-react/Components/Router';
import Utils from './components/Utils';//adapter-react/Components/Utils';
import ConfirmDialog from '@iobroker/adapter-react/Dialogs/Confirm';
import Icon from '@iobroker/adapter-react/Components/Icon';
import theme from '@iobroker/adapter-react/Theme';

import CommandDialog from './dialogs/CommandDialog';
import Drawer from './components/Drawer';
import { STATES as DrawerStates } from './components/Drawer';
import { DRAWER_FULL_WIDTH, DRAWER_COMPACT_WIDTH } from './components/Drawer';
import Connecting from './components/Connecting';

import WizardDialog from './dialogs/WizardDialog';
import SystemSettingsDialog from './dialogs/SystemSettingsDialog';
import Login from './login/Login';
import HostSelectors from './components/HostSelectors';
import { expertModeDialogFunc } from './dialogs/ExpertModeDialog';
import { checkMessages, newsAdminDialogFunc } from './dialogs/NewsAdminDialog';
import { hostWarningDialogFunc } from './dialogs/HostWarningDialog';
import ToggleThemeMenu from './components/ToggleThemeMenu';
import LogsWorker from './Workers/LogsWorker';
import InstancesWorker from './Workers/InstancesWorker';
import HostsWorker from './Workers/HostsWorker';
import AdaptersWorker from './Workers/AdaptersWorker';
import ObjectsWorker from './Workers/ObjectsWorker';
import DiscoveryDialog from './dialogs/DiscoveryDialog';
import SlowConnectionWarningDialog from './dialogs/SlowConnectionWarningDialog';
import IsVisible from './components/IsVisible';

// Tabs
const Adapters  = React.lazy(() => import('./tabs/Adapters'));
const Instances = React.lazy(() => import('./tabs/Instances'));
const Intro     = React.lazy(() => import('./tabs/Intro'));
const Logs      = React.lazy(() => import('./tabs/Logs'));
const Files     = React.lazy(() => import('./tabs/Files'));
const Objects   = React.lazy(() => import('./tabs/Objects'));
const Users     = React.lazy(() => import('./tabs/Users'));
const Enums     = React.lazy(() => import('./tabs/Enums'));
const CustomTab = React.lazy(() => import('./tabs/CustomTab'));
const Hosts     = React.lazy(() => import('./tabs/Hosts'));
const EasyMode  = React.lazy(() => import('./tabs/EasyMode'));

const query = {};
(window.location.search || '').replace(/^\?/, '').split('&').forEach(attr => {
    const parts = attr.split('=');
    if (!parts[0]) {
        return;
    }
    query[parts[0]] = parts[1] === undefined ? true : decodeURIComponent(parts[1]);
});

const styles = theme => ({
    root: {
        display: 'flex',
        height: '100%',
    },
    appBar: {
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    logoWhite: {
        background: '#FFFFFF'
    },
    appBarShift: {
        width: `calc(100% - ${DRAWER_FULL_WIDTH}px)`,
        marginLeft: DRAWER_FULL_WIDTH,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    appBarShiftCompact: {
        width: `calc(100% - ${DRAWER_COMPACT_WIDTH}px)`,
        marginLeft: DRAWER_COMPACT_WIDTH,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    hide: {
        display: 'none'
    },
    content: {
        flexGrow: 1,
        padding: theme.spacing(1),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        overflowY: 'auto',
        marginTop: theme.mixins.toolbar.minHeight,
        '@media (min-width:0px) and (orientation: landscape)': {
            marginTop: theme.mixins.toolbar['@media (min-width:0px) and (orientation: landscape)'].minHeight
        },
        '@media (min-width:600px)': {
            marginTop: theme.mixins.toolbar['@media (min-width:600px)'].minHeight
        }
    },
    contentMargin: {
        marginLeft: -DRAWER_FULL_WIDTH,
    },
    contentMarginCompact: {
        marginLeft: -DRAWER_COMPACT_WIDTH,
    },
    contentShift: {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0
    },
    expertIcon: {
        width: 22,
        height: 22,
        //color: theme.palette.text ? theme.palette.text.disabled : 'grey'
    },
    expertIconActive: {
        //color: theme.palette.action.active
    },
    baseSettingsButton: {
        color: 'red',
    },
    alert_info: {

    },
    alert_error: {
        backgroundColor: '#f44336'
    },
    alert_success: {
        backgroundColor: '#4caf50'
    },
    avatarNotVisible: {
        opacity: 0,
        marginLeft: 5,
        transition: 'opacity 0.3s',
        width: 'initial'
    },
    avatarVisible: {
        opacity: 1
    },
    cmd: {
        animation: '1s linear infinite alternate $myEffect',
        opacity: 0.2,
    },
    '@keyframes myEffect': {
        '0%': {
            opacity: 0.2,
            transform: 'translateY(0)'
        },
        '100%': {
            opacity: 1,
            transform: 'translateY(-10%)'
        }
    },
    errorCmd: {
        color: '#a90000',
        animation: '0.2s linear infinite alternate $myEffect2',
    },
    performed: {
        color: theme.palette.type === 'light' ? '#3bfd44' : '#388e3c',
        animation: '0.2s linear infinite alternate $myEffect2',
    },
    wrapperButtons: {
        display: 'flex',
        marginRight: 'auto',
        overflowY: 'auto'
    },
    '@keyframes myEffect2': {
        '0%': {
            opacity: 1,
            transform: 'translateX(0)'
        },
        '100%': {
            opacity: 0.7,
            transform: 'translateX(-2%)'
        }
    },

    flexGrow: {
        flexGrow: 2,
    },
    userBadge: {
        lineHeight: '48px'
    },
    userIcon: {
        borderRadius: 4,
        width: 48,
        height: 48,
        verticalAlign: 'middle',
    },
    userText: {
        verticalAlign: 'middle',
        fontSize: 16,
        maxWidth: 100,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'inline-block'
    },
    userBackground: {
        borderRadius: 4,
        backgroundColor: theme.palette.type === 'dark' ? '#EEE' : '#222',
        padding: 3,
    },
    styleVersion: {
        fontSize: 10,
    },
    wrapperName: {
        display: 'flex',
        flexDirection: 'column',
        marginRight: 10
    },
    expertBadge: {
        marginTop: 11,
        marginRight: 11,
    }
});

class App extends Router {
    constructor(props) {
        super(props);

        window.alert = message => {
            if (message && message.toString().toLowerCase().includes('error')) {
                console.error(message);
                this.showAlert(message.toString(), 'error');
            } else {
                console.log(message);
                this.showAlert(message.toString(), 'info');
            }
        };
        // init translations
        this.translations = {
            'en': require('@iobroker/adapter-react/i18n/en'),
            'de': require('@iobroker/adapter-react/i18n/de'),
            'ru': require('@iobroker/adapter-react/i18n/ru'),
            'pt': require('@iobroker/adapter-react/i18n/pt'),
            'nl': require('@iobroker/adapter-react/i18n/nl'),
            'fr': require('@iobroker/adapter-react/i18n/fr'),
            'it': require('@iobroker/adapter-react/i18n/it'),
            'es': require('@iobroker/adapter-react/i18n/es'),
            'pl': require('@iobroker/adapter-react/i18n/pl'),
            'zh-cn': require('@iobroker/adapter-react/i18n/zh-cn'),
        };

        const translations = {
            'en': require('./i18n/en'),
            'de': require('./i18n/de'),
            'ru': require('./i18n/ru'),
            'pt': require('./i18n/pt'),
            'nl': require('./i18n/nl'),
            'fr': require('./i18n/fr'),
            'it': require('./i18n/it'),
            'es': require('./i18n/es'),
            'pl': require('./i18n/pl'),
            'zh-cn': require('./i18n/zh-cn'),
        };
        // merge together
        Object.keys(translations).forEach(lang => this.translations[lang] = Object.assign(this.translations[lang], translations[lang]));

        // init translations
        I18n.setTranslations(this.translations);
        I18n.setLanguage((navigator.language || navigator.userLanguage || 'en').substring(0, 2).toLowerCase());

        this.refConfigIframe = null;
        this.refUser = React.createRef();
        this.refUserDiv = React.createRef();
        this.expireInSec = null;
        this.expireInSecInterval = null;
        this.expireText = I18n.t('Session expire in %s', '%s');
        this.adminGuiConfig = {admin: {menu: {}, settings: {}, adapters: {}, login: {}}};

        if (!query.login) {
            let drawerState = window.localStorage.getItem('App.drawerState');
            if (drawerState) {
                drawerState = parseInt(drawerState, 10);
            } else {
                drawerState = this.props.width === 'xs' ? DrawerStates.closed : DrawerStates.opened;
            }

            const theme = this.createTheme();

            this.state = {
                connected: false,
                progress: 0,
                ready: false,
                lang: 'en',

                //Finished
                protocol: this.getProtocol(),
                hostname: window.location.hostname,
                port: this.getPort(),
                //---------

                allTabs: null,

                expertMode: false,

                states: {},
                hosts: [],
                currentHost: '',
                currentHostName: '',
                currentTab: Router.getLocation(),
                currentDialog: null,
                currentUser: '',
                subscribesStates: {},
                subscribesObjects: {},
                subscribesLogs: 0,
                systemConfig: null,
                user: null, // Logged in user

                repository: {},
                installed: {},

                objects: {},

                waitForRestart: false,
                tabs: null,
                config: {},

                stateChanged: false,

                theme,
                themeName: this.getThemeName(theme),
                themeType: this.getThemeType(theme),

                alert: false,
                alertType: 'info',
                alertMessage: '',
                drawerState,

                tab: null,
                allStored: true,
                dataNotStoredDialog: false,
                dataNotStoredTab: '',

                baseSettingsOpened: false,
                unsavedDataInDialog: false,
                systemSettingsOpened: false,

                cmd: null,
                cmdDialog: false,
                wizard: true,
                commandError: false,
                performed: false,
                commandRunning: false,

                discoveryAlive: false,

                readTimeoutMs: SlowConnectionWarningDialog.getReadTimeoutMs(),
                showSlowConnectionWarning: false,

                expireInSec: null,

                versionAdmin: '',

                forceUpdateAdapters: 0,
            };
            this.logsWorker = null;
            this.instancesWorker = null;
            this.hostsWorker = null;
        } else {
            const theme = this.createTheme();
            this.state = {
                login: true,
                theme,
                themeName: this.getThemeName(theme),
                themeType: this.getThemeType(theme)
            }
        }
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasGlobalError: error };
    }

    componentDidCatch(error, info) {
        this.setState({hasGlobalError: error, hasGlobalErrorInfo: info});
    }

    setUnsavedData(hasUnsavedData) {
        if (hasUnsavedData !== this.state.unsavedDataInDialog) {
            this.setState({ unsavedDataInDialog: hasUnsavedData });
        }
    }

    // If the background color must be inverted. Depends on current theme.
    mustInvertBackground(color) {
        if (!color) {
            return false;
        } else {
            const invertedColor = Utils.invertColor(color, true);
            if (invertedColor === '#FFFFFF' && this.state.themeType === 'dark') {
                return true;
            } else
            if (invertedColor === '#000000' && this.state.themeType === 'light') {
                return true;
            } else {
                return false;
            }
        }
    }

    componentDidMount() {
        if (!this.state.login) {
            window.addEventListener('hashchange', this.onHashChanged, false);
            if (!this.state.currentTab.tab) {
                this.handleNavigation('tab-intro');
            } else {
                this.setTitle(this.state.currentTab.tab.replace('tab-', ''));
            }

            this.socket = new Connection({
                name: 'admin',
                admin5only: true,
                port: this.getPort(),
                autoSubscribes: ['system.adapter.*'], // do not subscribe on '*' and really we don't need a 'system.adapter.*' too. Every tab must subscribe itself on everything that it needs
                autoSubscribeLog: true,
                onProgress: progress => {
                    if (progress === PROGRESS.CONNECTING) {
                        this.setState({
                            connected: false
                        });
                    } else if (progress === PROGRESS.READY) {
                        const newState = {
                            connected: true,
                            progress: 100
                        };
                        if (this.state.cmd && this.state.cmd.match(/ admin(@[-.\w]+)?$/)) {
                            // close command dialog after reconnect (may be admin was restarted and update is now finished)
                            newState.commandRunning = false;
                            newState.forceUpdateAdapters = this.state.forceUpdateAdapters + 1;

                            this.closeCmdDialog(() => {
                                this.setState(newState);
                                window.location.reload(false);
                            });
                        } else {
                            this.setState(newState);
                        }
                    } else {
                        this.setState({
                            connected: true,
                            progress: Math.round(PROGRESS.READY / progress * 100)
                        });
                    }
                },
                onReady: async objects => {
                    I18n.setLanguage(this.socket.systemLang);

                    // Combine adminGuiConfig with user settings
                    this.adminGuiConfig = Object.assign({admin: {menu: {}, settings: {}, adapters: {}, login: {}}}, this.socket.systemConfig.native?.vendor);
                    this.adminGuiConfig.admin.menu     = this.adminGuiConfig.admin.menu     || {};
                    this.adminGuiConfig.admin.settings = this.adminGuiConfig.admin.settings || {};
                    this.adminGuiConfig.admin.adapters = this.adminGuiConfig.admin.adapters || {};
                    this.adminGuiConfig.admin.login    = this.adminGuiConfig.admin.login    || {};

                    this.socket.getCurrentInstance()
                        .then(adminInstance => {
                            this.adminInstance = adminInstance;
                            return this.socket.getIsEasyModeStrict();
                        })
                        .then(async isStrict => {
                            if (isStrict) {
                                return this.socket.getEasyMode()
                                    .then(config => {
                                        this.setState({
                                            lang: this.socket.systemLang,
                                            ready: true,
                                            strictEasyMode: true,
                                            easyModeConfigs: config.configs,
                                            objects,
                                        });
                                    });
                            } else {
                                // create Workers
                                this.logsWorker      = this.logsWorker      || new LogsWorker(this.socket, 1000);
                                this.instancesWorker = this.instancesWorker || new InstancesWorker(this.socket);
                                this.hostsWorker     = this.hostsWorker     || new HostsWorker(this.socket);
                                this.adaptersWorker  = this.adaptersWorker  || new AdaptersWorker(this.socket);
                                this.objectsWorker   = this.objectsWorker   || new ObjectsWorker(this.socket);

                                const newState = {
                                    lang: this.socket.systemLang,
                                    ready: true,
                                    objects,
                                };

                                try {
                                    newState.systemConfig = await this.socket.getCompactSystemConfig();
                                    newState.wizard = !newState.systemConfig.common.licenseConfirmed;
                                    newState.versionAdmin = (await this.socket.getVersion()).version;
                                    await this.findCurrentHost(newState);
                                    await this.readRepoAndInstalledInfo(newState.currentHost, newState.hosts);
                                } catch (error) {
                                    console.log(error);
                                }

                                this.adaptersWorker.registerRepositoryHandler(this.repoChangeHandler);
                                this.adaptersWorker.registerHandler(this.adaptersChangeHandler);

                                this.subscribeOnHostsStatus();

                                newState.expertMode = window.sessionStorage.getItem('App.expertMode') ? window.sessionStorage.getItem('App.expertMode') === 'true' : !!newState.systemConfig.common.expertMode;

                                // Read user and show him
                                if (this.socket.isSecure || this.socket.systemConfig.native?.vendor) {
                                    this.socket.getCurrentUser()
                                        .then(user => {
                                            this.socket.getObject('system.user.' + user)
                                                .then(userObj => {
                                                    if (userObj.native?.vendor) {
                                                        Object.assign(this.adminGuiConfig, userObj.native.vendor);
                                                    }

                                                    if (this.socket.isSecure) {
                                                        this.setState({
                                                            user: {
                                                                id: userObj._id,
                                                                name: Utils.getObjectNameFromObj(userObj, this.socket.systemLang),
                                                                color: userObj.common.color,
                                                                icon: userObj.common.icon,
                                                                invertBackground: this.mustInvertBackground(userObj.common.color)
                                                            }
                                                        });

                                                        // start ping interval
                                                        this.makePingAuth();
                                                    }
                                                })
                                        })
                                        .catch(error => {
                                            console.error(error);
                                            this.showAlert(error, 'error');
                                        });
                                }

                                this.setState(newState, () =>
                                    this.setCurrentTabTitle());

                                this.socket.subscribeState('system.adapter.discovery.0.alive', this.onDiscoveryAlive);

                                // Give some time for communication
                                setTimeout(() =>
                                    this.logsWorkerChanged(this.state.currentHost), 1000);

                                setTimeout(() =>
                                    this.findNewsInstance()
                                        .then(instance => this.socket.subscribeState(`admin.${instance}.info.newsFeed`, this.getNews(instance))),
                                    5000);

                                setTimeout(() =>
                                    this.hostsWorker.getNotifications(newState.currentHost)
                                        .then(notifications => this.showAdaptersWarning(notifications, this.socket, newState.currentHost)),
                                    3000);
                            }
                        })
                        .catch(error => {
                            console.error(error);
                            this.showAlert(error, 'error');
                        });
                },
                //onObjectChange: (objects, scripts) => this.onObjectChange(objects, scripts),
                onError: error => {
                    console.error(error);
                    this.showAlert(error, 'error');
                }
            });
        }
    }

    repoChangeHandler = () => {
        this.readRepoAndInstalledInfo(this.state.currentHost, null, true)
            .then(() => console.log('Repo updated!'));
    }

    adaptersChangeHandler = events => {
        // update installed
        //
        const installed = JSON.parse(JSON.stringify(this.state.installed));
        let changed = false;
        events.forEach(event => {
            const parts = event.id.split('.');
            const adapter = parts[2];
            if (event.type === 'delete' || !event.obj) {
                if (installed[adapter]) {
                    changed = true;
                    delete installed[adapter];
                }
            } else {
                if (installed[adapter]) {
                    Object.keys(installed[adapter])
                        .forEach(attr => {
                            if (installed[adapter][attr] !== event.obj.common[attr]) {
                                installed[adapter][attr] = event.obj.common[attr];
                                changed = true;
                            }
                        });
                } else {
                    installed[adapter] = {version: event.obj.common.version};
                    changed = true;
                }
            }
        });

        changed && this.setState({installed});
    }

    async findCurrentHost(newState) {
        newState.hosts = await this.socket.getCompactHosts();

        if (!this.state.currentHost) {
            const currentHost = window.localStorage.getItem('App.currentHost');

            const itemHost = newState.hosts.find(host => host._id === currentHost);

            if (currentHost && itemHost) {
                newState.currentHost     = itemHost._id;
                newState.currentHostName = itemHost.common?.name || itemHost._id.replace('system.host.', '');
            } else {
                newState.currentHost     = newState.hosts[0]._id;
                newState.currentHostName = newState.hosts[0].common?.name || newState.hosts[0]._id.replace('system.host.', '');
            }
        }

        // Check that host is alive
        let alive;
        try {
            alive = await this.socket.getState(newState.currentHost + '.alive');
        } catch (e) {
            alive = null;
            console.warn(`Cannot get state ${newState.currentHost}.alive: ${e}`);
        }

        if (!alive || !alive.val) {
            // find first alive host
            for (let h = 0; h < newState.hosts.length; h++) {
                alive = await this.socket.getState(newState.hosts[h]._id + '.alive');
                if (alive && alive.val) {
                    newState.currentHost     = newState.hosts[h]._id;
                    newState.currentHostName = newState.hosts[h].common.name;
                }
            }
        }
    }

    updateExpireIn() {
        const now = Date.now();
        this.expireInSec -= (now - this.lastExecution) / 1000;
        const time = Utils.formatTime(this.expireInSec);
        if (this.refUser.current) {
            this.refUser.current.title = this.expireText.replace('%s', time);
        }
        if (this.expireInSec < 120 && this.refUserDiv.current) {
            this.refUserDiv.current.innerHTML = time;
            this.refUserDiv.current.style.color = '#F44';
        }

        if (this.expireInSec <= 0) {
            window.alert('Session expired');
            // reconnect
            setTimeout(() =>
                window.location.reload(false), 1000);
        }

        this.lastExecution = now;
    }

    makePingAuth() {
        this.pingAuth && clearTimeout(this.pingAuth);
        this.pingAuth = null;

        this.socket.getCurrentSession()
            .then(data => {
                if (data) {
                    if (!this.expireInSecInterval) {
                        this.expireInSecInterval = setInterval(() => this.updateExpireIn(), 1000);
                    }
                    this.expireInSec = data.expireInSec;
                    this.lastExecution = Date.now();
                    this.updateExpireIn();
                }

                /*this.pingAuth = setTimeout(() => {
                    this.pingAuth = null;
                    this.makePingAuth();
                }, 30000);*/
            })
            .catch(e => {
                window.alert('Session timeout: ' + e);
                // reconnect
                setTimeout(() =>
                    window.location.reload(false), 1000);
            })
    }

    onDiscoveryAlive = (name, value) => {
        if (!!(value && !!value.val) !== this.state.discoveryAlive) {
            this.setState({ discoveryAlive: !!(value && !!value.val) });
        }
    }

    getDiscoveryModal = () => {
        return <DiscoveryDialog
            themeType={this.state.themeType}
            themeName={this.state.themeName}
            socket={this.socket}
            dateFormat={this.state.systemConfig.common.dateFormat}
            currentHost={this.state.currentHost}
            defaultLogLevel={this.state.systemConfig.common.defaultLogLevel}
            repository={this.state.repository}
            hosts={this.state.hosts}
            onClose={() => Router.doNavigate(null)}
        />;
    }

    findNewsInstance = () => {
        const maxCount = 200;
        return new Promise(async resolve => {
            for (let instance = 0; instance < maxCount; instance++) {
                try {
                    let adminAlive = await this.socket.getState(`system.adapter.admin.${instance}.alive`);
                    if (adminAlive && adminAlive.val) {
                        resolve(instance);
                        break;
                    }
                } catch (error) {
                    console.error(error);
                    this.showAlert(error, 'error');
                }
            }
            resolve(0);
        });
    }

    showAdaptersWarning = (notifications, socket, host) => {
        if (!notifications || !notifications[host] || !notifications[host].result) {
            return Promise.resolve();
        }

        const result = notifications[host].result;

        if (result && result.system && Object.keys(result.system.categories).length) {
            return this.instancesWorker.getInstances()
                .then(instances => {
                    hostWarningDialogFunc(
                        result.system.categories,
                        this.state.systemConfig.common.dateFormat,
                        this.state.themeType,
                        this.state.themeName,
                        instances,
                        name => socket.clearNotifications(host, name)
                    );
                });
        } else {
            return Promise.resolve();
        }
    }

    getNews = instance => async (name, newsFeed) => {
        try {
            const lastNewsId = await this.socket.getState(`admin.${instance}.info.newsLastId`);
            if (newsFeed && newsFeed.val) {
                let news = null;
                try {
                    news = JSON.parse(newsFeed?.val);
                } catch (error) {
                    console.error('Cannot parse news: ' + newsFeed?.val);
                }

                if (news && news.length && news[0].id !== lastNewsId?.val) {
                    this.socket.getUuid()
                        .then(uuid => this.socket.getHostInfo(this.state.currentHost)
                            .catch(() => null)
                            .then(info => this.socket.getCompactInstances()
                                .catch(() => null)
                                .then(instances => {
                                    const checkNews = checkMessages(news, lastNewsId?.val, {
                                        lang: I18n.getLanguage(),
                                        adapters: this.state.adapters,
                                        instances: instances || [],
                                        nodeVersion: info ? info['Node.js'] || '?' : '?',
                                        npmVersion: info ? info.NPM || '?' : '?',
                                        os: info ? info.os || '?' : '?',
                                        activeRepo: this.state.systemConfig.common.activeRepo,
                                        uuid
                                    });

                                    if (checkNews && checkNews.length) {
                                        newsAdminDialogFunc(checkNews, lastNewsId?.val, this.state.themeName, this.state.themeType, id =>
                                            this.socket.setState(`admin.${instance}.info.newsLastId`, { val: id, ack: true }));
                                    }
                                })));
                }
            }

        } catch (error) {
            console.error(error);
            this.showAlert(error, 'error');
        }
    }

    renderSlowConnectionWarning() {
        if (!this.state.showSlowConnectionWarning) {
            return null;
        } else {
            return <SlowConnectionWarningDialog
                readTimeoutMs={this.state.readTimeoutMs}
                t={I18n.t}
                onClose={readTimeoutMs => {
                    if (readTimeoutMs) {
                        this.setState({showSlowConnectionWarning: false, readTimeoutMs}, () =>
                            this.readRepoAndInstalledInfo(this.state.currentHost));
                    } else {
                        this.setState({showSlowConnectionWarning: false});
                    }
                }}
            />;
        }
    }

    readRepoAndInstalledInfo = async (currentHost, hosts, update) => {
        hosts = hosts || this.state.hosts;
        let repository;
        let installed;

        return this.socket.getCompactRepository(currentHost, update, this.state.readTimeoutMs)
            .catch(e => {
                window.alert('Cannot getRepositoryCompact: ' + e);
                e.toString().includes('timeout') && this.setState({showSlowConnectionWarning: true});
                return {};
            })
            .then(_repository => {
                repository = _repository;
                return this.socket.getCompactInstalled(currentHost, update, this.state.readTimeoutMs)
                    .catch(e => {
                        window.alert('Cannot getInstalled: ' + e);
                        e.toString().includes('timeout') && this.setState({showSlowConnectionWarning: true});
                        return {};
                    });
            })
            .then(_installed => {
                installed = _installed;
                return this.socket.getCompactAdapters(update)
                    .catch(e => window.alert('Cannot read adapters: ' + e));
            })
            .then(adapters => {
                installed && adapters && Object.keys(adapters).forEach(id => {
                    if (installed[id] && adapters[id].iv) {
                        installed[id].ignoreVersion = adapters[id].iv;
                    }
                });

                this.setState({ repository, installed, hosts, adapters });
            });
    }

    logsWorkerChanged = currentHost => {
        this.logsWorker && this.logsWorker.setCurrentHost(currentHost);
    }

    onHostStatusChanged = (id, state) => {
        const host = this.state.hosts.find(_id => id + '.alive' === id);
        if (host) {
            // TODO!! => update hostSelector
            console.log(`Current status ${id}: ${state?.val}`);
        }
    };

    subscribeOnHostsStatus(hosts) {
        hosts = hosts || this.state.hosts;
        hosts.forEach(item =>
            this.socket.subscribeState(item._id + '.alive', this.onHostStatusChanged));
    }

    unsubscribeOnHostsStatus() {
        this.state.hosts && this.socket && this.state.hosts.forEach(item =>
            this.socket.unsubscribeState(item._id + '.alive', this.onHostStatusChanged));
    }

    componentWillUnmount() {
        window.removeEventListener('hashchange', this.onHashChanged, false);
        this.socket && this.socket.unsubscribeState('system.adapter.discovery.0.alive', this.onDiscoveryAlive);

        this.adaptersWorker && this.adaptersWorker.unregisterRepositoryHandler(this.repoChangeHandler);
        this.adaptersWorker && this.adaptersWorker.unregisterHandler(this.adaptersChangeHandler);

        this.pingAuth && clearTimeout(this.pingAuth);
        this.pingAuth = null;
        this.expireInSecInterval && clearInterval(this.expireInSecInterval);
        this.expireInSecInterval = null;
        this.unsubscribeOnHostsStatus();
    }

    /**
     * Updates the current currentTab in the states
     */
    onHashChanged = el => {
        this.setState({
            currentTab: Router.getLocation()
        }, () => this.setCurrentTabTitle());
    }

    /**
     * Get the used port
     */
    getPort() {
        let port = parseInt(window.location.port, 10);

        if (isNaN(port)) {
            switch (this.getProtocol()) {
                case 'https:':
                    port = 443;
                    break;
                case 'http:':
                    port = 80;
                    break;
                default:
                    break;
            }
        }

        if (!port || port === 3000) {
            port = 8081;
        }

        return port;
    }

    /**
     * Get the used protocol
     */
    getProtocol() {
        return window.location.protocol;
    }

    /**
     * Get a theme
     * @param {string} name Theme name
     * @returns {Theme}
     */
    createTheme(name) {
        return theme(Utils.getThemeName(name));
    }

    /**
     * Get the theme name
     * @param {Theme} theme Theme
     * @returns {string} Theme name
     */
    getThemeName(theme) {
        return theme.name;
    }

    /**
     * Get the theme type
     * @param {Theme} theme Theme
     * @returns {string} Theme type
     */
    getThemeType(theme) {
        return theme.palette.type;
    }

    /**
     * Changes the current theme
     */
    toggleTheme = currentThemeName => {
        const themeName = this.state.themeName;

        const newThemeName = currentThemeName || Utils.toggleTheme(themeName);

        const theme = this.createTheme(newThemeName);

        this.setState({
            theme: theme,
            themeName: newThemeName,
            themeType: this.getThemeType(theme)
        }, () => {
            this.refConfigIframe?.contentWindow?.postMessage('updateTheme', '*');
        });
    }

    async onObjectChange(id, obj) {
        console.log('OBJECT: ' + id);
        if (obj) {
            this.setState(prevState => {
                const objects = prevState.objects;
                objects[id] = obj;

                return { objects };
            });
        } else {
            this.setState(prevState => {
                const objects = prevState.objects;
                delete objects[id];

                return { objects };
            });
        }
    }

    setCurrentTabTitle() {
        this.setTitle(this.state.currentTab.tab.replace('tab-', ''));
    }

    setTitle(title) {
        document.title = title + ' - ' + (this.state.currentHostName || 'ioBroker');
    }

    getCurrentTab() {
        if (this.state && this.state.currentTab && this.state.currentTab.tab) {
            if (this.state.currentTab.tab === 'tab-adapters') {
                const small = this.props.width === 'xs' || this.props.width === 'sm';
                const compact = !small && (this.state.drawerState === DrawerStates.compact);
                const opened = !small && (this.state.drawerState === DrawerStates.opened);
                const closed = small || (this.state.drawerState === DrawerStates.closed);

                return <Suspense fallback={<Connecting />}>
                    <Adapters
                        key={'adapters_' + this.state.currentHost + '_' + this.state.forceUpdateAdapters}
                        theme={this.state.theme}
                        themeName={this.state.themeName}
                        adaptersWorker={this.adaptersWorker}
                        instancesWorker={this.instancesWorker}
                        themeType={this.state.themeType}
                        systemConfig={this.state.systemConfig}
                        socket={this.socket}
                        hosts={this.state.hosts}
                        currentHost={this.state.currentHost}
                        ready={this.state.ready}
                        t={I18n.t}
                        lang={I18n.getLanguage()}
                        expertMode={this.state.expertMode}
                        executeCommand={(cmd, cb) => this.executeCommand(cmd, cb)}
                        commandRunning={this.state.commandRunning}
                        onSetCommandRunning={commandRunning => this.setState({ commandRunning })}
                        menuOpened={opened}
                        menuClosed={closed}
                        menuCompact={compact}
                        adminGuiConfig={this.adminGuiConfig}
                    />
                </Suspense>;
            } else if (this.state.currentTab.tab === 'tab-instances') {
                return <Suspense fallback={<Connecting />}>
                    <Instances
                        key="instances"
                        menuPadding={this.state.drawerState === DrawerStates.closed ? 0 : (this.state.drawerState === DrawerStates.opened ? DRAWER_FULL_WIDTH : DRAWER_COMPACT_WIDTH)}
                        socket={this.socket}
                        instancesWorker={this.instancesWorker}
                        lang={I18n.getLanguage()}

                        protocol={this.state.protocol}
                        hostname={this.state.hostname}
                        port={this.state.port}
                        adminInstance={this.adminInstance}
                        repository={this.state.repository}

                        hosts={this.state.hosts}
                        themeName={this.state.themeName}
                        themeType={this.state.themeType}
                        theme={this.state.theme}
                        expertMode={this.state.expertMode}
                        currentHost={this.state.currentHost}
                        currentHostName={this.state.currentHostName}
                        t={I18n.t}
                        dateFormat={this.state.systemConfig.common.dateFormat}
                        isFloatComma={this.state.systemConfig.common.isFloatComma}
                        width={this.props.width}
                        configStored={value => this.allStored(value)}
                        executeCommand={(cmd, cb) => this.executeCommand(cmd, cb)}
                        inBackgroundCommand={this.state.commandError || this.state.performed}

                        onRegisterIframeRef={ref => this.refConfigIframe = ref}
                        onUnregisterIframeRef={ref => {
                            if (this.refConfigIframe === ref) {
                                this.refConfigIframe = null;
                            }
                        }}
                    />
                </Suspense>;
            } else if (this.state.currentTab.tab === 'tab-intro') {
                return <Suspense fallback={<Connecting />}>
                    <Intro
                        key="intro"

                        protocol={this.state.protocol}
                        hostname={this.state.hostname}
                        port={this.state.port}
                        adminInstance={this.adminInstance}

                        showAlert={(message, type) => this.showAlert(message, type)}
                        socket={this.socket}
                        t={I18n.t}
                        lang={I18n.getLanguage()}
                    />
                </Suspense>;
            } else if (this.state.currentTab.tab === 'tab-logs') {
                return <Suspense fallback={<Connecting />}>
                    <Logs
                        key="logs"
                        t={I18n.t}
                        lang={this.state.lang}
                        socket={this.socket}
                        themeType={this.state.themeType}
                        ready={this.state.ready}
                        logsWorker={this.logsWorker}
                        expertMode={this.state.expertMode}
                        currentHost={this.state.currentHost}
                        hostsWorker={this.hostsWorker}
                        clearErrors={cb => this.clearLogErrors(cb)}
                    />
                </Suspense>;
            } else if (this.state.currentTab.tab === 'tab-files') {
                return <Suspense fallback={<Connecting />}>
                    <Files
                        key="files"
                        ready={this.state.ready}
                        t={I18n.t}
                        expertMode={this.state.expertMode}
                        lang={I18n.getLanguage()}
                        socket={this.socket}
                        themeName={this.state.themeName}
                        themeType={this.state.themeType}
                    />
                </Suspense>;
            } else if (this.state.currentTab.tab === 'tab-users') {
                return <Suspense fallback={<Connecting />}>
                    <Users
                        key="users"
                        ready={this.state.ready}
                        t={I18n.t}
                        expertMode={this.state.expertMode}
                        lang={I18n.getLanguage()}
                        socket={this.socket}
                        themeType={this.state.themeType}
                    />
                </Suspense>;
            } else if (this.state.currentTab.tab === 'tab-enums') {
                return <Suspense fallback={<Connecting />}>
                    <Enums
                        key="enums"
                        ready={this.state.ready}
                        t={I18n.t}
                        expertMode={this.state.expertMode}
                        lang={I18n.getLanguage()}
                        socket={this.socket}
                        themeType={this.state.themeType}
                    />
                </Suspense>;
            } else if (this.state.currentTab.tab === 'tab-objects') {
                return <Suspense fallback={<Connecting />}>
                    <Objects
                        key="objects"
                        t={I18n.t}
                        theme={this.state.theme}
                        themeName={this.state.themeName}
                        themeType={this.state.themeType}
                        expertMode={this.state.expertMode}
                        objectsWorker={this.objectsWorker}
                        lang={I18n.getLanguage()}
                        socket={this.socket}
                        dateFormat={this.state.systemConfig.common.dateFormat}
                        isFloatComma={this.state.systemConfig.common.isFloatComma}
                    />
                </Suspense>;
            } else if (this.state.currentTab.tab === 'tab-hosts') {
                return <Suspense fallback={<Connecting />}>
                    <Hosts
                        socket={this.socket}
                        lang={I18n.getLanguage()}

                        hostsWorker={this.hostsWorker}

                        themeName={this.state.themeName}
                        expertMode={this.state.expertMode}
                        t={I18n.t}
                        navigate={Router.doNavigate}
                        currentHost={this.state.currentHost}
                        executeCommand={(cmd, cb) => this.executeCommand(cmd, cb)}
                        systemConfig={this.state.systemConfig}
                        showAdaptersWarning={this.showAdaptersWarning}
                    />
                </Suspense>;
            } else {
                const m = this.state.currentTab.tab.match(/^tab-([-\w\d]+)(-\d+)?$/);
                if (m) {
                    /*const adapter  = m[1];
                    const instance = m[2] ? parseInt(m[2], 10) : null;

                    let link  = tab.common.adminTab.link || '/adapter/' + tab.common.name + '/tab.html';
                    if (tab.common.materializeTab) {
                        link  = tab.common.adminTab.link || '/adapter/' + tab.common.name + '/tab_m.html';
                    }*/

                    // /adapter/javascript/tab.html
                    return <Suspense fallback={<Connecting />}>
                        <CustomTab
                            key={this.state.currentTab.tab}
                            t={I18n.t}

                            protocol={this.state.protocol}
                            hostname={this.state.hostname}
                            port={this.state.port}
                            adminInstance={this.adminInstance}
                            hosts={this.state.hosts}

                            instancesWorker={this.instancesWorker}
                            tab={this.state.currentTab.tab}
                            themeName={this.state.themeName}
                            expertMode={this.state.expertMode}
                            lang={I18n.getLanguage()}
                            onRegisterIframeRef={ref => this.refConfigIframe = ref}
                            onUnregisterIframeRef={ref => {
                                if (this.refConfigIframe === ref) {
                                    this.refConfigIframe = null;
                                }
                            }}
                        />
                    </Suspense>;
                }
            }
        }

        return null;
    }

    clearLogErrors = async () => {
        this.logsWorker.resetErrors();
        this.logsWorker.resetWarnings();
    }

    getCurrentDialog() {
        if (this.state && this.state.currentTab && this.state.currentTab.dialog) {
            if (this.state.currentTab.dialog === 'system') {
                return this.getSystemSettingsDialog();
            } else if (this.state.currentTab.dialog === 'discovery') {
                return this.getDiscoveryModal();
            }
        }
        return null;
    }

    getSystemSettingsDialog() {
        return <SystemSettingsDialog
            adminGuiConfig={this.adminGuiConfig}
            width={this.props.width}
            currentHost={this.state.currentHost}
            themeName={this.state.themeName}
            themeType={this.state.themeType}
            theme={this.state.theme}
            key="systemSettings"
            onClose={() => Router.doNavigate(null)}
            lang={this.state.lang}
            showAlert={(message, type) => this.showAlert(message, type)}
            socket={this.socket}
            currentTab={this.state.currentTab}
            instance={this.state.instance}
            expertModeFunc={value => {
                window.sessionStorage.removeItem('App.expertMode');
                const systemConfig = JSON.parse(JSON.stringify(this.state.systemConfig));
                systemConfig.common.expertMode = value;
                this.setState({ expertMode: value, systemConfig });
            }}
            t={I18n.t}
        />;
    }

    handleAlertClose(event, reason) {
        if (reason === 'clickaway') {
            return;
        }

        this.setState({ alert: false });
    }

    showAlert(message, type) {
        if (type !== 'error' && type !== 'warning' && type !== 'info' && type !== 'success') {
            type = 'info';
        }

        this.setState({
            alert: true,
            alertType: type,
            alertMessage: message
        });
    }

    handleDrawerState(state) {
        window.localStorage.setItem('App.drawerState', state);
        this.setState({
            drawerState: state
        });
    }

    logout() {
        if (window.location.port === '3000') {
            window.location = window.location.protocol + '//' + window.location.hostname + ':8081/logout?dev';
        } else {
            window.location = '/logout';
        }
    }

    handleNavigation(tab) {
        if (tab) {
            if (this.state.allStored) {

                Router.doNavigate(tab);

                this.setState({ currentTab: Router.getLocation() });
            } else {
                this.setState({
                    dataNotStoredDialog: true,
                    dataNotStoredTab: tab
                });
            }
        }

        if (this.props.width === 'xs' || this.props.width === 'sm') {
            this.handleDrawerState(DrawerStates.closed);
        }

        tab = tab || (this.state.currentTab && this.state.currentTab.tab) || '';

        this.setTitle(tab.replace('tab-', ''));
    }

    allStored(value) {
        this.setState({
            allStored: value
        });
    };

    closeDataNotStoredDialog() {
        this.setState({ dataNotStoredDialog: false });
    }

    confirmDataNotStored() {
        this.setState({
            dataNotStoredDialog: false,
            allStored: true
        }, () => {
            this.handleNavigation(this.state.dataNotStoredTab);
        });
    }

    executeCommand(cmd, callback = false) {
        if (this.state.performed || this.state.commandError) {
            return this.setState({
                cmd: null,
                cmdDialog: false,
                commandError: false,
                performed: false,
                callback: false
            }, () => {
                this.setState({
                    cmd,
                    cmdDialog: true,
                    callback
                });
            });
        } else {
            console.log('Execute: ' + cmd);
            this.setState({
                cmd,
                cmdDialog: true,
                callback
            });
        }
    }

    closeCmdDialog(cb) {
        this.setState({
            cmd: null,
            cmdDialog: false,
            commandError: false,
            performed: false,
            callback: false
        }, () => cb && cb());
    }

    renderWizardDialog() {
        if (this.state.wizard) {
            return <WizardDialog
                socket={this.socket}
                themeName={this.state.themeName}
                toggleTheme={this.toggleTheme}
                t={I18n.t}
                lang={I18n.getLanguage()}
                onClose={() =>
                    this.setState({ wizard: false })}
            />;
        }
    }

    renderCommandDialog() {
        return this.state.cmd ?
            <CommandDialog
                onSetCommandRunning={commandRunning => this.setState({ commandRunning })}
                onClose={() =>
                    this.closeCmdDialog(() =>
                        this.setState({ commandRunning: false }))}
                visible={this.state.cmdDialog}
                callback={this.state.callback}
                header={I18n.t('Command')}
                onInBackground={() => this.setState({ cmdDialog: false })}
                cmd={this.state.cmd}
                errorFunc={() => this.setState({ commandError: true })}
                performed={() => this.setState({ performed: true })}
                inBackground={this.state.commandError || this.state.performed}
                commandError={this.state.commandError}
                socket={this.socket}
                currentHost={this.state.currentHost}
                ready={this.state.ready}
                t={I18n.t}
            /> : null;
    }

    renderLoggedUser() {
        if (this.state.user && this.props.width !== 'xs' && this.props.width !== 'sm') {
            return <div title={this.state.user.id} className={clsx(this.props.classes.userBadge, this.state.user.invertBackground && this.props.classes.userBackground)} ref={this.refUser}>
                {this.state.user.icon ?
                    <Icon src={this.state.user.icon} className={this.props.classes.userIcon} />
                    :
                    <UserIcon className={this.props.classes.userIcon} />}
                <div ref={this.refUserDiv} style={{ color: this.state.user.color || undefined }} className={this.props.classes.userText}>{this.state.user.name}</div>
            </div>
        } else {
            return null;
        }
    }

    renderConfirmDialog() {
        /*return <ConfirmDialog
            onClose={() => this.closeDataNotStoredDialog()}
            open={this.state.dataNotStoredDialog}
            header={I18n.t('Please confirm')}
            onConfirm={() => this.confirmDataNotStored()}
            confirmText={I18n.t('Ok')}
        >
            {I18n.t('Some data are not stored. Discard?')}
        </ConfirmDialog>;*/
        return this.state.dataNotStoredDialog && <ConfirmDialog
            title={I18n.t('Please confirm')}
            text={I18n.t('Some data are not stored. Discard?')}
            ok={I18n.t('Ok')}
            cancel={I18n.t('Cancel')}
            onClose={isYes =>
                isYes ? this.confirmDataNotStored() : this.closeDataNotStoredDialog()}
        />;
    }

    render() {
        const { classes } = this.props;
        const small = this.props.width === 'xs' || this.props.width === 'sm';

        if (this.state.hasGlobalError) {
            const message = this.state.hasGlobalError.message;
            const stack = this.state.hasGlobalError.stack;

            return <div style={{textAlign: 'center', fontSize: 22, marginTop: 50, height: 'calc(100% - 50px)', overflow: 'auto'}}>
                <h1 style={{color: '#F00'}}>Error in GUI!</h1>
                Please open the browser console (F12), copy error text from there and create the issue on <a href="https://github.com/ioBroker/ioBroker.admin/issues" target="_blank" rel="noreferrer">github</a><br/>
                Without this information it is not possible to analyse the error.<br/>
                It should looks like <br/>
                <img src="img/browserError.png" alt="error"/><br/>
                If in the second line you will see <code style={{style: '#888', fontFamily: 'monospace', fontSize: 16}}>at :3000/static/js/main.chunk.js:36903</code> and not the normal file name,<br/>
                please try to reproduce an error with opened browser console. In this case the special "map" files will be loaded and the developers can see the real name of functions and files.

                <div style={{color: '#F88', fontSize: 14, marginTop: 20}}>{message}</div>
                <pre style={{color: '#F88', fontSize: 12, fontFamily: 'monospace', textAlign: 'left', marginTop: 20, padding: 20}}>{(stack || '').split('\n').join((line, i) => <div key={i}>{line}<br/></div>)}</pre>
            </div>;
        }

        if (this.state.login) {
            return <ThemeProvider theme={this.state.theme}>
                <Login t={I18n.t} />
            </ThemeProvider>;
        } else
        if (!this.state.ready) {
            return <ThemeProvider theme={this.state.theme}>
                {window.vendorPrefix === 'PT' ? <LoaderPT theme={this.state.themeType}/> :null}
                {window.vendorPrefix && window.vendorPrefix !== 'PT' && window.vendorPrefix !== '@@vendorPrefix@@' ? <LoaderVendor theme={this.state.themeType}/> :null}
                {!window.vendorPrefix || window.vendorPrefix === '@@vendorPrefix@@' ? <Loader theme={this.state.themeType} /> : null}
            </ThemeProvider>;
        } else if (this.state.strictEasyMode || this.state.currentTab.tab === 'easy') {
            return <ThemeProvider theme={this.state.theme}>
                {!this.state.connected && <Connecting />}
                <Suspense fallback={<Connecting />}>
                    <EasyMode
                        navigate={Router.doNavigate}
                        getLocation={Router.getLocation}
                        location={this.state.currentTab}
                        toggleTheme={this.toggleTheme}
                        themeName={this.state.themeName}
                        themeType={this.state.themeType}
                        theme={this.state.theme}
                        width={this.props.width}
                        configs={this.state.easyModeConfigs}
                        socket={this.socket}
                        configStored={value => this.allStored(value)}
                        isFloatComma={this.state.systemConfig?.common.isFloatComma}
                        dateFormat={this.state.systemConfig?.common.dateFormat}
                        systemConfig={this.state.systemConfig}
                        t={I18n.t}
                        lang={I18n.getLanguage()}
                        onRegisterIframeRef={ref => this.refConfigIframe = ref}
                        onUnregisterIframeRef={ref => {
                            if (this.refConfigIframe === ref) {
                                this.refConfigIframe = null;
                            }
                        }}
                    />
                </Suspense>
            </ThemeProvider>;
        }

        const expertModePermanent = !window.sessionStorage.getItem('App.expertMode') || (window.sessionStorage.getItem('App.expertMode') === 'true') === !!this.state.systemConfig.common.expertMode;

        return <ThemeProvider theme={this.state.theme}>
            <Paper elevation={0} className={classes.root}>
                <AppBar
                    color="default"
                    position="fixed"
                    className={clsx(
                        classes.appBar,
                        { [classes.appBarShift]: !small && this.state.drawerState === DrawerStates.opened },
                        { [classes.appBarShiftCompact]: !small && this.state.drawerState === DrawerStates.compact }
                    )}
                >
                    <Toolbar>
                        <IconButton
                            edge="start"
                            className={clsx(classes.menuButton, !small && this.state.drawerState !== DrawerStates.closed && classes.hide)}
                            onClick={() => this.handleDrawerState(DrawerStates.opened)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <div className={classes.wrapperButtons}>
                            <IsVisible name="admin.appBar.discovery" config={this.adminGuiConfig}>
                                {this.state.discoveryAlive && <Tooltip title={I18n.t('Discovery devices')}>
                                    <IconButton onClick={() => Router.doNavigate(null, 'discovery')}>
                                        <VisibilityIcon />
                                    </IconButton>
                                </Tooltip>}
                            </IsVisible>
                            <IsVisible name="admin.appBar.systemSettings" config={this.adminGuiConfig}>
                                <Tooltip title={I18n.t('System settings')}>
                                    <IconButton onClick={() => Router.doNavigate(null, 'system')}>
                                        <BuildIcon />
                                    </IconButton>
                                </Tooltip>
                            </IsVisible>
                            <IsVisible name="admin.appBar.toggleTheme" config={this.adminGuiConfig}>
                                <ToggleThemeMenu
                                    toggleTheme={this.toggleTheme}
                                    themeName={this.state.themeName}
                                    t={I18n.t} />
                            </IsVisible>
                            <IsVisible name="admin.appBar.expertMode" config={this.adminGuiConfig}>
                                <Tooltip
                                    title={`${I18n.t('Toggle expert mode')} ${expertModePermanent ? '' : ' (' + I18n.t('only in this browser session') + ')'}`}
                                >
                                    <Badge
                                        color="secondary"
                                        variant="dot"
                                        classes={{badge: this.props.classes.expertBadge}}
                                        invisible={expertModePermanent}
                                    >
                                        <IconButton
                                            onClick={() => {
                                                if (!!this.state.systemConfig.common.expertMode === !this.state.expertMode) {
                                                    window.sessionStorage.setItem('App.expertMode', !this.state.expertMode);
                                                    this.setState({ expertMode: !this.state.expertMode });
                                                    this.refConfigIframe?.contentWindow?.postMessage('updateExpertMode', '*');
                                                } else {
                                                    if (window.sessionStorage.getItem('App.doNotShowExpertDialog') === 'true') {
                                                        window.sessionStorage.setItem('App.expertMode', !this.state.expertMode);
                                                        this.setState({ expertMode: !this.state.expertMode });
                                                        this.refConfigIframe?.contentWindow?.postMessage('updateExpertMode', '*');
                                                    } else {
                                                        expertModeDialogFunc(this.state.expertMode, this.state.themeType, () => {
                                                            window.sessionStorage.setItem('App.expertMode', !this.state.expertMode);
                                                            this.setState({ expertMode: !this.state.expertMode });
                                                            this.refConfigIframe?.contentWindow?.postMessage('updateExpertMode', '*');
                                                        }, () => Router.doNavigate(null, 'system'));
                                                    }
                                                }
                                            }}
                                            style={{ color: this.state.expertMode ? this.state.theme.palette.expert : undefined }}
                                            color="default"
                                        >
                                            <ExpertIcon
                                                title={I18n.t('Toggle expert mode')}
                                                glowColor={this.state.theme.palette.secondary.main}
                                                active={this.state.expertMode}
                                                className={clsx(classes.expertIcon, this.state.expertMode && classes.expertIconActive)}
                                            />
                                        </IconButton>
                                    </Badge>
                                </Tooltip>
                            </IsVisible>
                            <IsVisible name="admin.appBar.hostSelector" config={this.adminGuiConfig}>
                                <HostSelectors
                                    expertMode={this.state.expertMode}
                                    socket={this.socket}
                                    hostsWorker={this.hostsWorker}
                                    currentHost={this.state.currentHost}
                                    setCurrentHost={(hostName, host) => {
                                        this.setState({
                                            currentHostName: hostName,
                                            currentHost: host
                                        }, () => {
                                            this.logsWorkerChanged(host);
                                            window.localStorage.setItem('App.currentHost', host);

                                            this.readRepoAndInstalledInfo(host, this.state.hosts)
                                                .then(() =>
                                                    // read notifications from host
                                                    this.hostsWorker.getNotifications(host)
                                                        .then(notifications => this.showAdaptersWarning(notifications, this.socket, host)));
                                        });
                                    }}
                                    disabled={
                                        this.state.currentTab.tab !== 'tab-instances' &&
                                        this.state.currentTab.tab !== 'tab-adapters' &&
                                        this.state.currentTab.tab !== 'tab-logs'
                                    }
                                />
                            </IsVisible>
                            <div className={classes.flexGrow} />
                            {this.state.cmd && !this.state.cmdDialog && <IconButton onClick={() => this.setState({ cmdDialog: true })}>
                                <PictureInPictureAltIcon className={this.state.commandError ? classes.errorCmd : this.state.performed ? classes.performed : classes.cmd} />
                            </IconButton>}
                        </div>

                        {this.renderLoggedUser()}

                        {this.state.drawerState !== 0 &&
                            <Grid container className={clsx(this.state.drawerState !== 0 && classes.avatarVisible, classes.avatarNotVisible)} spacing={1} alignItems="center">
                                {(!this.state.user || this.props.width === 'xs' || this.props.width === 'sm') &&
                                    <Hidden xsDown>
                                        <div className={classes.wrapperName}>
                                            <Typography>admin</Typography>
                                            {!this.adminGuiConfig.icon && this.state.versionAdmin && <Typography className={classes.styleVersion} style={{color: this.state.themeType === 'dark' ? '#ffffff80' : '#00000080'}}>v{this.state.versionAdmin}</Typography>}
                                        </div>
                                    </Hidden>}
                                <Grid item>
                                    <a href="/#easy" onClick={event => event.preventDefault()} style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {this.adminGuiConfig.icon ?
                                            <div style={{
                                                height: 50,
                                                withWidth: 102,
                                                lineHeight: '50px',
                                                background: 'white',
                                                borderRadius: 5,
                                                padding: 5}}
                                            ><img src={this.adminGuiConfig.icon} alt="logo"
                                                      style={{maxWidth: '100%', maxHeight: '100%'}}/></div>
                                            :
                                            <Avatar
                                                onClick={() => this.handleNavigation('easy')}
                                                className={clsx((this.state.themeName === 'colored' || this.state.themeName === 'blue') && classes.logoWhite)}
                                                alt="ioBroker"
                                                src="img/no-image.png"
                                            />
                                        }
                                    </a>
                                </Grid>
                            </Grid>
                        }
                    </Toolbar>
                </AppBar>
                <DndProvider backend={!small ? HTML5Backend : TouchBackend}>
                    <Drawer
                        adminGuiConfig={this.adminGuiConfig}
                        state={this.state.drawerState}
                        systemConfig={this.state.systemConfig}
                        handleNavigation={name => this.handleNavigation(name)}
                        onStateChange={state => this.handleDrawerState(state)}
                        onLogout={() => this.logout()}
                        currentTab={this.state.currentTab && this.state.currentTab.tab}
                        instancesWorker={this.instancesWorker}
                        hostsWorker={this.hostsWorker}
                        logsWorker={this.logsWorker}
                        logoutTitle={I18n.t('Logout')}
                        isSecure={this.socket.isSecure}
                        versionAdmin={this.state.versionAdmin}
                        t={I18n.t}
                        lang={I18n.getLanguage()}
                        socket={this.socket}
                        expertMode={this.state.expertMode}
                        ready={this.state.ready}
                        themeName={this.state.themeName}
                        themeType={this.state.themeType}

                        protocol={this.state.protocol}
                        hostname={this.state.hostname}
                        port={this.state.port}
                        adminInstance={this.adminInstance}

                        hosts={this.state.hosts}
                        repository={this.state.repository}
                        installed={this.state.installed}
                    />
                </DndProvider>
                <Paper
                    elevation={0}
                    square
                    className={
                        clsx(classes.content, {
                            [classes.contentMargin]: !small && this.state.drawerState !== DrawerStates.compact,
                            [classes.contentMarginCompact]: !small && this.state.drawerState !== DrawerStates.opened,
                            [classes.contentShift]: !small && this.state.drawerState !== DrawerStates.closed
                        })
                    }
                >
                    {this.getCurrentTab()}
                </Paper>
                <Snackbar
                    className={this.props.classes['alert_' + this.state.alertType]}
                    open={this.state.alert}
                    autoHideDuration={6000}
                    onClose={() => this.handleAlertClose()}
                    message={this.state.alertMessage}
                />
            </Paper>
            {this.getCurrentDialog()}
            {this.renderConfirmDialog()}
            {this.renderCommandDialog()}
            {this.renderWizardDialog()}
            {this.renderSlowConnectionWarning()}
            {!this.state.connected && <Connecting />}
        </ThemeProvider>;
    }
}

export default withWidth()(withStyles(styles)(App));
