function Adapters(main) {
    'use strict';

    var that = this;

    this.curRepository     = null;
    this.curRepoLastUpdate = null;
    this.curInstalled      = null;
    this.list   = [];
    this.$tab   = $('#tab-adapters');
    this.$grid  = this.$tab.find('#grid-adapters');
    this.$tiles = this.$tab.find('#grid-adapters-tiles');
    this.$installDialog = $('#dialog-install-url');
    this.main   = main;
    this.tree   = [];
    this.data   = {};
    this.urls   = {};
    this.groupImages = {
        'common adapters_group':  'img/common.png',
        'general_group':          'img/common.png',
        'hardware_group':         'img/hardware.png',
        'lighting_group':         'img/hardware.png',
        'energy_group':           'img/hardware.png',
        'household_group':        'img/hardware.png',
        'iot-systems_group':      'img/hardware.png',
        'climate-control_group':  'img/hardware.png',
        'infrastructure_group':   'img/hardware.png',
        'garden_group':           'img/hardware.png',
        'alarm_group':            'img/hardware.png',
        'script_group':           'img/script.png',
        'logic_group':            'img/script.png',
        'media_group':            'img/media.png',
        'multimedia_group':       'img/media.png',
        'communication_group':    'img/communication.png',
        'protocols_group':        'img/communication.png',
        'network_group':          'img/communication.png',
        'messaging_group':        'img/communication.png',
        'visualisation_group':    'img/visualisation.png',
        'visualization_group':    'img/visualisation.png',
        'visualization-icons_group': 'img/visualisation.png',
        'visualization-widgets_group': 'img/visualisation.png',
        'storage_group':          'img/storage.png',
        'weather_group':          'img/weather.png',
        'schedule_group':         'img/schedule.png',
        'vis_group':              'img/vis.png',
        'date-and-time_group':    'img/service.png',
        'geoposition_group':      'img/service.png',
        'utility_group':          'img/service.png',
        'misc-data_group':        'img/service.png',
        'service_group':          'img/service.png',
        'third-party_group':      'img/service.png'
    };
    this.inited = false;

    this.isList        = false;
    this.filterVals    = {length: 0};
    this.onlyInstalled = false;
    this.onlyUpdatable = false;
    this.currentFilter = '';
    this.currentType   = '';
    this.isCollapsed   = {};
    this.isTiles       = true;

    this.types = {
        occ:          'schedule'
    };

    function getVersionClass(version) {
        if (version) {
            var tmp = version.split ('.');
            if (tmp[0] === '0' && tmp[1] === '0' && tmp[2] === '0') {
                version = 'planned';
            } else if (tmp[0] === '0' && tmp[1] === '0') {
                version = 'alpha';
            } else if (tmp[0] === '0') {
                version = 'beta'
            } else if (version === 'npm error') {
                version = 'error';
            } else {
                version = 'stable';
            }
        }
        return version;
    }

    function prepareTable() {
        that.$grid.show();
        that.$tiles.html('').hide();
        that.$tab.find('#main-toolbar-table-types-btn').hide();

        if (!that.$grid.data('inited')) {
            that.$grid.data('inited', true);
            that.$grid.fancytree({
                extensions: ['table', 'gridnav', 'filter', 'themeroller'],
                checkbox:   false,
                table: {
                    indentation: 5      // indent 20px per node level
                },
                show: function (currentId, filter, onSuccess) {
                    that.sortTree();
                },
                source:     that.tree,
                renderColumns: function(event, data) {
                    var node = data.node;
                    var $tdList = $(node.tr).find('>td');
                    var obj = that.data[node.key];

                    function ellipsis(txt) {
                        var ret = '<div style="padding-left: ' + lineIndent + '; overflow: hidden; white-space: nowrap; text-overflow: ellipsis !important;">' +
                            txt +
                            '</div>';
                        return ret;
                    }

                    if (!obj) {
                        $tdList.eq(0).css({'font-weight': 'bold'});
                        $tdList.eq(0).find('img').remove();
                        $tdList.eq(0).find('span.fancytree-title').attr('style', 'padding-left: 0px !important');

                        // Calculate total count of adapter and count of installed adapter
                        for (var c = 0; c < that.tree.length; c++) {
                            if (that.tree[c].key === node.key) {
                                $tdList.eq(1).html(that.tree[c].desc).css({'overflow': 'hidden', 'white-space': 'nowrap', position: 'relative'});
                                var installed = 0;
                                for (var k = 0; k < that.tree[c].children.length; k++) {
                                    if (that.data[that.tree[c].children[k].key].installed) installed++;
                                }
                                that.tree[c].installed = installed;
                                node.data.installed = installed;
                                var title;
                                //if (!that.onlyInstalled && !that.onlyUpdatable) {
                                title = '[<span title="' + _('Installed from group') + '">' + installed + '</span> / <span title="' + _('Total count in group') + '">' + that.tree[c].children.length + '</span>]';
                                $tdList.eq(1).html(ellipsis('<span class="dark-green">' + installed + '</span> ' + _('of') + '<span class="dark-blue"> ' + that.tree[c].children.length + '</span> ' + _('Adapters from this Group installed')));
                                break;
                            }
                        }
                        return;
                    }

                    $tdList.eq(0).css({'overflow': 'hidden', 'white-space': 'nowrap'});

                    function setHtml(no, html) {
                        return $tdList.eq(no).html(ellipsis(html));
                    }

                    var idx = obj.desc.indexOf('<div');
                    var desc = idx >= 0 ? obj.desc.substr(0, idx) : obj.desc;
                    $tdList.eq(1).html(ellipsis(obj.desc))
                        .attr('title', desc)
                        .css({"white-space": "nowrap", position: 'relative', 'font-weight': obj.bold ? 'bold' : null}).find('>div>div')
                        .css('height:22px !important')
                    ;

                    setHtml(2, obj.keywords).attr('title', obj.keywords);

                    $tdList.eq(3).html(obj.installed);
                    $tdList.eq(4).html(obj.version); //.css({ position: 'relative'});

                    // setHtml(5, obj.platform);// actually there is only one platform
                    setHtml(5, obj.license);
                    setHtml(6, obj.install);

                    that.initButtons(node.key);
                    // If we render this element, that means it is expanded
                    if (that.isCollapsed[obj.group]) {
                        that.isCollapsed[obj.group] = false;
                        that.main.saveConfig('adaptersIsCollapsed', JSON.stringify(that.isCollapsed));
                    }
                },
                gridnav: {
                    autofocusInput:   false,
                    handleCursorKeys: true
                },
                filter: {
                    mode: 'hide',
                    autoApply: true
                },
                collapse: function(event, data) {
                    if (that.isCollapsed[data.node.key]) return;
                    that.isCollapsed[data.node.key] = true;
                    that.main.saveConfig('adaptersIsCollapsed', JSON.stringify(that.isCollapsed));
                }
            });

            that.$tab.find('#btn_collapse_adapters').show().unbind('click').click(function () {
                that.$tab.find('.process-adapters').show();
                setTimeout(function () {
                    that.$grid.fancytree('getRootNode').visit(function (node) {
                        if (!that.filterVals.length || node.match || node.subMatch) node.setExpanded(false);
                    });
                    that.$tab.find('.process-adapters').hide();
                }, 100);
            });

            that.$tab.find('#btn_expand_adapters').show().unbind('click').click(function () {
                that.$tab.find('.process-adapters').show();
                setTimeout(function () {
                    that.$grid.fancytree('getRootNode').visit(function (node) {
                        if (!that.filterVals.length || node.match || node.subMatch)
                            node.setExpanded(true);
                    });
                    that.$tab.find('.process-adapters').hide();
                }, 100);
            });

            that.$tab.find('#btn_list_adapters').show().unbind('click').click(function () {
                var $processAdapters = that.$tab.find('.process-adapters');
                $processAdapters.show();
                that.isList = !that.isList;
                if (that.isList) {
                    that.$tab.find('#btn_list_adapters').addClass('red lighten-3');
                    that.$tab.find('#btn_expand_adapters').hide();
                    that.$tab.find('#btn_collapse_adapters').hide();
                    $(this).attr('title', _('list'));
                } else {
                    that.$tab.find('#btn_list_adapters').removeClass('red lighten-3');
                    that.$tab.find('#btn_expand_adapters').show();
                    that.$tab.find('#btn_collapse_adapters').show();
                    $(this).attr('title', _('tree'));
                }
                that.main.saveConfig('adaptersIsList', that.isList);
                $processAdapters.show();

                setTimeout(function () {
                    that._postInit(true);
                    $processAdapters.hide();
                }, 200);
            });
        } else {
            that.$tab.find('#btn_collapse_adapters').show();
            that.$tab.find('#btn_expand_adapters').show();
            that.$tab.find('#btn_list_adapters').show();
        }

        if (that.isList) {
            that.$tab.find('#btn_list_adapters').addClass('red lighten-3').attr('title', _('tree'));
            that.$tab.find('#btn_expand_adapters').hide();
            that.$tab.find('#btn_collapse_adapters').hide();
        } else {
            that.$tab.find('#btn_list_adapters').removeClass('red lighten-3').attr('title', _('list'));
            that.$tab.find('#btn_expand_adapters').show();
            that.$tab.find('#btn_collapse_adapters').show();
        }

        that.$tab.find('.adapters-filter-input').trigger('change');
    }

    function prepareTiles() {
        that.$grid.hide();
        that.$tiles.show();
        that.$tab.find('#main-toolbar-table-types-btn').show();
        that.$tab.find('#btn_list_adapters').hide();
        that.$tab.find('#btn_collapse_adapters').hide();
        that.$tab.find('#btn_expand_adapters').hide();
        that.$tab.find('.adapters-filter-input').trigger('change');
    }

    function onOnlyUpdatableChanged() {
        if (that.onlyUpdatable) {
            that.$tab.find('#btn_filter_updates').addClass('red lighten-3');
            that.$tab.find('#btn_upgrade_all').show();
        } else {
            that.$tab.find('#btn_upgrade_all').hide();
            that.$tab.find('#btn_filter_updates').removeClass('red lighten-3');
        }
    }

    function onExpertmodeChanged() {
        if (that.main.config.expertMode) {
            that.$tab.find('#btn_adapters_expert_mode').addClass('red lighten-3');
            that.$tab.find('#btn_upgrade_all').show();
        } else {
            that.$tab.find('#btn_adapters_expert_mode').removeClass('red lighten-3');
            onOnlyUpdatableChanged();
        }
    }

    function filterTiles() {
        // filter
        if (that.currentFilter) {
            that.$tiles.find('.tile').each(function () {
                var $this = $(this);
                if (that.currentType && !$this.hasClass('class-' + that.currentType)) {
                    $this.hide();
                    return;
                }

                if (customFilter({key: $this.data('id')})) {
                    $this.show();
                } else {
                    $this.hide();
                }
            });
        } else {
            if (!that.currentType) {
                that.$tiles.find('.tile').show();
            } else {
                that.$tiles.find('.tile').hide();
                that.$tiles.find('.class-' + that.currentType).show();

            }
        }
    }

    this.prepare = function () {
        that.$tab.find('#btn_switch_adapters').unbind('click').click(function () {
            that.$tab.find('.process-adapters').show();
            that.isTiles = !that.isTiles;

            if (that.isTiles) {
                $(this).find('i').text('view_list');
            } else {
                $(this).find('i').text('view_module');
            }

            that.main.saveConfig('adaptersIsTiles', that.isTiles);

            setTimeout(function () {
                if (that.isTiles) {
                    prepareTiles();
                } else {
                    prepareTable();
                }
                that._postInit(true);
                that.$tab.find('.process-adapters').hide();
            }, 50);
        });

        that.$tab.find('#btn_filter_adapters').unbind('click').click(function () {
            that.$tab.find('.process-adapters').show();
            that.onlyInstalled = !that.onlyInstalled;
            if (that.onlyInstalled) {
                that.$tab.find('#btn_filter_adapters').addClass('red lighten-3');
            } else {
                that.$tab.find('#btn_filter_adapters').removeClass('red lighten-3');
            }
            that.main.saveConfig('adaptersOnlyInstalled', that.onlyInstalled);

            setTimeout(function () {
                that._postInit(true);
                that.$tab.find('.process-adapters').hide();
            }, 50);
        });

        that.$tab.find('#btn_filter_updates').unbind('click').click(function () {
            that.$tab.find('.process-adapters').show();
            that.onlyUpdatable = !that.onlyUpdatable;
            onOnlyUpdatableChanged();

            that.main.saveConfig('adaptersOnlyUpdatable', that.onlyUpdatable);

            setTimeout(function () {
                that._postInit(true);
                that.$tab.find('.process-adapters').hide();
            }, 200);
        });

        that.$tab.find('#btn_filter_custom_url')
            .unbind('click')
            .click(function () {
                // prepare adapters
                var text  = '<option value="">' + _('none') + '</option>';
                var order = [];
                var url;
                for (url in that.urls) {
                    if (that.urls.hasOwnProperty(url)) {
                        order.push(url);
                    }
                }
                order.sort();

                for (var o = 0; o < order.length; o++) {
                    var user = that.urls[order[o]].match(/\.com\/([-_$§A-Za-z0-9]+)\/([-._$§A-Za-z0-9]+)\//);
                    if (user && user.length >= 2 && (that.main.config.expertMode || order[o].indexOf('js-controller') === -1)) {
                        text += '<option value="https://github.com/' + user[1] + '/ioBroker.' + order[o] + '/tarball/master ' + order[o] + '">' + order[o] + '</option>';
                    }
                }
                that.$installDialog.find('#install-github-link').html(text).val(that.main.config.adaptersGithub || '');

                that.$installDialog.modal();

                that.$installDialog.find('.btn-install').unbind('click').click(function () {
                    var isCustom = !that.$installDialog.find('a[href="#tabs-install-github"]').hasClass('active');//!!that.$installDialog.find('#tabs-install').tabs('option', 'active');
                    var url;
                    var debug;
                    var adapter;
                    if (isCustom) {
                        url     = that.$installDialog.find('#install-url-link').val();
                        debug   = that.$installDialog.find('#install-url-debug').prop('checked') ? ' --debug' : '';
                        adapter = '';
                    } else {
                        var parts = that.$installDialog.find('#install-github-link').val().split(' ');
                        url     = parts[0];
                        debug   = that.$installDialog.find('#install-github-debug').prop('checked') ? ' --debug' : '';
                        adapter = ' ' + parts[1];
                    }

                    if (!url) {
                        that.main.showError(_('Invalid link'));
                        return;
                    }

                    that.main.cmdExec(null, 'url "' + url + '"' + adapter + debug, function (exitCode) {
                        if (!exitCode) {
                            that.init(true, true);
                        }
                    });
                });
                that.$installDialog.find('#install-github-link').select();
                // workaround for materialize checkbox problem
                that.$installDialog.find('input[type="checkbox"]+span').unbind('click').click(function () {
                    var $input = $(this).prev();
                    if (!$input.prop('disabled')) {
                        $input.prop('checked', !$input.prop('checked')).trigger('change');
                    }
                });
                that.$installDialog.modal('open');
                that.$installDialog.find('.tabs').mtabs({
                    nShow: function (tab)  {
                        if (!tab) return;
                        that.main.saveConfig('adaptersInstallTab', $(tab).attr('id'));
                    }
                });
                if (that.main.config.adaptersInstallTab) {
                    that.$installDialog.find('.tabs').mtabs('select', that.main.config.adaptersInstallTab);
                }
            });

        that.$tab.find('#btn_upgrade_all').unbind('click').click(function () {
            that.main.confirmMessage(_('Do you want to upgrade all adapters?'), _('Please confirm'), 'help', function (result) {
                if (result) {
                    that.main.cmdExec(null, 'upgrade', function (exitCode) {
                        if (!exitCode) that._postInit(true);
                    });
                }
            });
        });

        that.$tab.find('#btn_adapters_expert_mode').click(function () {
            that.main.config.expertMode = !that.main.config.expertMode;
            that.main.saveConfig('expertMode', that.main.config.expertMode);
            that.updateExpertMode();
            that.main.tabs.instances.updateExpertMode();
        });

        if (that.main.config.expertMode) {
            that.$tab.find('#btn_adapters_expert_mode').addClass('red lighten-3');
        }

        // save last selected adapter
        that.$installDialog.find('#install-github-link').change(function () {
            that.main.saveConfig('adaptersGithub', $(this).val());
        });
        that.$installDialog.find('#install-url-link').keyup(function (event) {
            if (event.which === 13) {
                that.$installDialog.find('#dialog-install-url-button').trigger('click');
            }
        });

        // Load settings
        that.isTiles       = (that.main.config.adaptersIsTiles !== undefined && that.main.config.adaptersIsTiles !== null) ? that.main.config.adaptersIsTiles : true;
        that.isList        = that.main.config.adaptersIsList        || false;
        that.onlyInstalled = that.main.config.adaptersOnlyInstalled || false;
        that.onlyUpdatable = that.main.config.adaptersOnlyUpdatable || false;
        that.currentFilter = that.main.config.adaptersCurrentFilter || '';
        that.currentType   = that.main.config.adaptersCurrentType   || '';
        that.currentOrder  = that.main.config.adaptersCurrentOrder  || '';
        that.isCollapsed   = that.main.config.adaptersIsCollapsed ? JSON.parse(that.main.config.adaptersIsCollapsed) : {};
        if (that.currentFilter) {
            that.$tab.find('.adapters-filter-input').addClass('input-not-empty').val(that.currentFilter);
            that.$tab.find('.adapters-filter-clear').show();
        } else {
            that.$tab.find('.adapters-filter-clear').hide();
        }

        if (that.onlyInstalled) {
            that.$tab.find('#btn_filter_adapters').addClass('red lighten-3');
        } else {
            that.$tab.find('#btn_filter_adapters').removeClass('red lighten-3');
        }

        onExpertmodeChanged();

        that.$tab.find('#btn_refresh_adapters').click(function () {
            that.init(true, true);
        });

        // add filter processing
        that.$tab.find('.adapters-filter-input').keyup(function () {
            $(this).trigger('change');
        }).on('change', function (event) {
            if (that.filterTimer) {
                clearTimeout(that.filterTimer);
            }
            that.filterTimer = setTimeout(function () {
                that.filterTimer = null;
                that.currentFilter = that.$tab.find('.adapters-filter-input').val().toLowerCase();
                event && event.target && $(event.target)[that.currentFilter ? 'addClass' : 'removeClass']('input-not-empty');
                if (that.currentFilter) {
                    that.$tab.find('.adapters-filter-clear').show();
                } else {
                    that.$tab.find('.adapters-filter-clear').hide();
                }

                that.main.saveConfig('adaptersCurrentFilter', that.currentFilter);
                if (that.isTiles) {
                    filterTiles();
                } else {
                    that.$grid.fancytree('getTree').filterNodes(customFilter, false);
                }
            }, 400);
        });

        that.$tab.find('.adapters-filter-clear').click(function () {
            that.$tab.find('.adapters-filter-input').val('').trigger('change');
        });

        if (this.isTiles) {
            that.$tab.find('#btn_switch_adapters').find('i').text('view_list');
            prepareTiles();
        } else {
            prepareTable();
        }
    };

    this.updateExpertMode = function () {
        this.init(true);
        onExpertmodeChanged();
    };

    function customFilter(node) {
        //if (node.parent && node.parent.match) return true;

        if (that.currentFilter) {
             if (!that.data[node.key]) return false;

             var title = that.data[node.key].title;
             if (title && typeof title === 'object') {
                 title = title[systemLang] || title.en;
             }
            var desc = that.data[node.key].desc;
            if (desc && typeof desc === 'object') {
                desc = desc[systemLang] || desc.en;
            }

            if ((that.data[node.key].name      && that.data[node.key].name.toLowerCase().indexOf(that.currentFilter)     !== -1) ||
                 (title                        && title.toLowerCase().indexOf(that.currentFilter)                        !== -1) ||
                 (that.data[node.key].keywords && that.data[node.key].keywords.toLowerCase().indexOf(that.currentFilter) !== -1) ||
                 (desc                         && desc.toLowerCase().indexOf(that.currentFilter)                         !== -1)){
                return true;
             } else {
                 return false;
             }
        } else {
            return true;
        }
    }

    this.getAdaptersInfo = function (host, update, updateRepo, callback) {
        if (!host) return;

        if (!callback) throw 'Callback cannot be null or undefined';
        if (update) {
            // Do not update too often
            if (!this.curRepoLastUpdate || ((new Date()).getTime() - this.curRepoLastUpdate > 1000)) {
                this.curRepository = null;
                this.curInstalled  = null;
            }
        }

        if (this.curRunning) {
            this.curRunning.push(callback);
            return;
        }

        if (!this.curRepository) {
            this.main.socket.emit('sendToHost', host, 'getRepository', {repo: this.main.systemConfig.common.activeRepo, update: updateRepo}, function (_repository) {
                if (_repository === 'permissionError') {
                    console.error('May not read "getRepository"');
                    _repository = {};
                }

                that.curRepository = _repository || {};
                if (that.curRepository && that.curInstalled && that.curRunning) {
                    that.curRepoLastUpdate = (new Date()).getTime();
                    setTimeout(function () {
                        for (var c = 0; c < that.curRunning.length; c++) {
                            that.curRunning[c](that.curRepository, that.curInstalled);
                        }
                        that.curRunning = null;
                    }, 0);
                }
            });
        }
        if (!this.curInstalled) {
            this.main.socket.emit('sendToHost', host, 'getInstalled', null, function (_installed) {
                if (_installed === 'permissionError') {
                    console.error('May not read "getInstalled"');
                    _installed = {};
                }

                that.curInstalled = _installed || {};
                if (that.curRepository && that.curInstalled) {
                    that.curRepoLastUpdate = (new Date()).getTime();
                    setTimeout(function () {
                        for (var c = 0; c < that.curRunning.length; c++) {
                            that.curRunning[c](that.curRepository, that.curInstalled);
                        }
                        that.curRunning = null;
                    }, 0);
                }
            });
        }

        if (this.curInstalled && this.curRepository) {
            setTimeout(function () {
                if (that.curRunning) {
                    for (var c = 0; c < that.curRunning.length; c++) {
                        that.curRunning[c](that.curRepository, that.curInstalled);
                    }
                    that.curRunning = null;
                }
                if (callback) callback(that.curRepository, that.curInstalled);
            }, 0);
        } else {
            this.curRunning = [callback];
        }
    };

    this.enableColResize = function () {
        if (!$.fn.colResizable) return;
        if (this.$grid.is(':visible')) {
            this.$grid.colResizable({liveDrag: true});
        }
    };

    function getNews(actualVersion, adapter) {
        var text = '';
        if (adapter.news) {
            for (var v in adapter.news) {
                if (systemLang === v) text += (text ? '\n' : '') + adapter.news[v];
                if (v === 'en' || v === 'ru'  || v === 'de') continue;
                if (v === actualVersion) break;
                text += (text ? '\n' : '') + (adapter.news[v][systemLang] || adapter.news[v].en);
            }
        }
        return text;
    }

    function checkDependencies(dependencies) {
        if (!dependencies) return '';
        // like [{"js-controller": ">=0.10.1"}]
        var adapters;
        if (dependencies instanceof Array) {
            adapters = {};
            for (var a = 0; a < dependencies.length; a++) {
                if (typeof dependencies[a] === 'string') continue;
                for (var b in dependencies[a]) adapters[b] = dependencies[a][b];
            }
        } else {
            adapters = dependencies;
        }

        for (var adapter in adapters) {
            if (adapter === 'js-controller') {
                if (!semver.satisfies(that.main.objects['system.host.' + that.main.currentHost].common.installedVersion, adapters[adapter])) return _('Invalid version of %s. Required %s', adapter, adapters[adapter]);
            } else {
                if (!that.main.objects['system.adapter.' + adapter] || !that.main.objects['system.adapter.' + adapter].common || !that.main.objects['system.adapter.' + adapter].common.installedVersion) return _('No version of %s', adapter);
                if (!semver.satisfies(that.main.objects['system.adapter.' + adapter].common.installedVersion, adapters[adapter])) return _('Invalid version of %s', adapter);
            }
        }
        return '';
    }

    this.sortTree = function() {
        function sort(c1, c2) {
            //var d1 = that.data[c1.key], d2 = that.data[c1.key];
            var inst1 = c1.data.installed || 0, inst2 = c2.data.installed || 0;
            var ret = inst2 - inst1;
            if (ret) return ret;
            var t1 = c1.title || '';
            if (typeof t1 === 'object') {
                t1 = t1[systemLang] || t1.en;
            }
            var t2 = c2.title || '';
            if (typeof t2 === 'object') {
                t2 = t2[systemLang] || t2.en;
            }

            t1 = t1.toLowerCase();
            t2 = t2.toLowerCase();
            if (t1 > t2) return 1;
            if (t1 < t2) return -1;
            return 0;
        }
        that.$grid.fancytree('getRootNode').sortChildren(sort, true);
    };

    this._postInit = function (update, updateRepo) {
        if (typeof this.$grid !== 'undefined') {

            that.$tab.find('.process-adapters').show();

            this.$grid.find('tbody').html('');

            this.getAdaptersInfo(this.main.currentHost, update, updateRepo, function (repository, installedList) {
                var obj;
                var version;
                var adapter;

                var listInstalled = [];
                var listNonInstalled = [];

                if (installedList) {
                    for (adapter in installedList) {
                        if (!installedList.hasOwnProperty(adapter)) continue;
                        obj = installedList[adapter];
                        if (!obj || obj.controller || adapter === 'hosts') continue;
                        listInstalled.push(adapter);
                    }
                    listInstalled.sort();
                }

                that.urls = {};
                // List of adapters for repository
                for (adapter in repository) {
                    if (!repository.hasOwnProperty(adapter)) continue;
                    // it is not possible to install this adapter from git
                    if (!repository[adapter].nogit) {
                        that.urls[adapter] = repository[adapter].meta;
                    }
                    obj = repository[adapter];
                    if (!obj || obj.controller) continue;
                    version = '';
                    if (installedList && installedList[adapter]) continue;
                    listNonInstalled.push(adapter);
                }
                listNonInstalled.sort();

                function getVersionString(version, updatable, news, updatableError) {
                    //var span = getVersionSpan(version);
                    var color = getVersionClass(version);
                    var title = color + '\n\r' + (news || '');
                    //version = '<table style="min-width: 80px; width: 100%; text-align: center; border: 0; border-spacing: 0px;' + (news ? 'font-weight: bold;' : '') + '" cellspacing="0" cellpadding="0" class="ui-widget">' +
                    version = //'<div style="height: 100% !important;">' +
                        '<table style="cursor: alias; width: 100%; text-align: center; border: 0; border-spacing: 0;' + (news ? 'color: blue;' : '') + '" cellspacing="0" cellpadding="0" class="ui-widget">' +
                        '<tr class="' + color + 'Bg">' +
                        '<td title="' + _('Available version:') + ' ' + title + '" class="actual-version">' + version + '</td>' +
                        '<td style="border: 0; padding: 0; width: 30px" class="update-version">';
                    if (updatable) {    //xxx
                        version += '<button class="adapter-update-submit" data-adapter-name="' + adapter + '" ' + (updatableError ? ' disabled title="' + updatableError + '"' : 'title="' + _ ('update') + '"') + '></button>';
                        //version = version.replace('class="', 'class="updateReady ');
                        $ ('a[href="#tab-adapters"]').addClass('updateReady');
                    }
                    version += '</td></tr></table>';
                    return version;
                }

                that.tree = [];
                that.data = {};

                // list of the installed adapters
                for (var i = 0; i < listInstalled.length; i++) {
                    adapter = listInstalled[i];

                    obj = installedList ? installedList[adapter] : null;

                    if (obj) {
                        that.urls[adapter] = installedList[adapter].readme || installedList[adapter].extIcon || installedList[adapter].licenseUrl;
                        if (!that.urls[adapter]) delete that.urls[adapter];
                    }

                    if (!obj || obj.controller || adapter === 'hosts') continue;
                    var installed = '';
                    var rawInstalled = '';
                    var icon = obj.icon;
                    version = '';

                    if (repository[adapter] && repository[adapter].version) version = repository[adapter].version;

                    if (repository[adapter] && repository[adapter].extIcon) icon = repository[adapter].extIcon;

                    if (obj.version) {
                        var news = '';
                        var updatable = false;
                        var updatableError = '';
                        if (!that.main.upToDate(version, obj.version)) {
                            news = getNews(obj.version, repository[adapter]);
                            // check if version is compatible with current adapters and js-controller
                            updatable = true;
                            updatableError = checkDependencies(repository[adapter].dependencies);
                        }
                        // TODO: move style to class
                        installed = '<table style="min-width: 80px; text-align: center; border: 0; border-spacing: 0;' /*+ (news ? 'font-weight: bold;' : '')*/ + '" cellspacing="0" cellpadding="0" class="ui-widget">' +
                            '<tr>';

                        var _instances = 0;
                        var _enabled   = 0;

                        // Show information about installed and enabled instances
                        for (var z = 0; z < that.main.instances.length; z++) {
                            if (that.main.objects[that.main.instances[z]] &&
                                that.main.objects[that.main.instances[z]].common.name === adapter) {
                                _instances++;
                                if (that.main.objects[that.main.instances[z]].common.enabled) _enabled++;
                            }
                        }
                        if (_instances) {
                            // TODO: move style to class
                            installed += '<td style="border: 0; padding: 0; width: 40px">';
                            if (_enabled !== _instances) {
                                installed += '<span title="' + _ ('Installed instances') + '">' + _instances + '</span>';
                                if (_enabled) installed += ' ~ ';
                            }
                            if (_enabled) installed += '<span title="' + _('Active instances') + '" class="true">' + _enabled + '</span>';
                            installed += '</td>';
                        } else {
                            // TODO: move style to class
                            installed += '<td style="border: 0; padding: 0; width: 40px"></td>';
                        }
                        // TODO: move style to class
                        installed += '<td style="border: 0; padding: 0; width: 50px" title="' + _('Installed version') + '">' + obj.version + '</td>';
                        rawInstalled = '<span class="installed" title="' + _('Installed version') + '">' + obj.version + '</span>';

                        //tmp = installed.split('.');
                        // if (updatable) {    //xxx
                        //     //TODO
                        //     // installed += '<td style="border: 0; padding: 0; width: 30px"><button class="adapter-update-submit" data-adapter-name="' + adapter + '" ' + (updatableError ? ' disabled title="' + updatableError + '"' : 'title="' + _('update') + '"')+ '></button></td>';
                        //     // version = version.replace('class="', 'class="updateReady ');
                        //     // $('a[href="#tab-adapters"]').addClass('updateReady');
                        // } else if (that.onlyUpdatable) {
                        //     continue;
                        // }

                        installed += '</tr></table>';
                        if (!updatable && that.onlyUpdatable) continue;
                    }
                    version = getVersionString(version, updatable, news, updatableError);

                    var group = (obj.type || that.types[adapter] || 'common adapters') + '_group';
                    var desc  = (typeof obj.desc === 'object') ? (obj.desc[systemLang] || obj.desc.en) : obj.desc;
                    desc += showUploadProgress(group, adapter, that.main.states['system.adapter.' + adapter + '.upload'] ? that.main.states['system.adapter.' + adapter + '.upload'].val : 0);
                    var title = (typeof obj.title === 'object') ? (obj.title[systemLang] || obj.title.en) : obj.title;

                    that.data[adapter] = {
                        image:      icon ? '<img onerror="this.src=\'img/info-big.png\';" src="' + icon + '" class="adapter-table-icon" />' : '',
                        icon:       icon || '',
                        stat:        repository[adapter] ? repository[adapter].stat : 0,
                        name:       adapter,
                        title:      (title || '').replace('ioBroker Visualisation - ', ''),
                        desc:       desc,
                        keywords:   obj.keywords ? obj.keywords.join(' ') : '',
                        version:    version,
                        installed:  installed,
                        rawInstalled: rawInstalled,
                        updatable:  updatable,
                        bold:       obj.highlight || false,
                        install: '<button data-adapter-name="' + adapter + '" class="adapter-install-submit td-button" title="' + _('add instance') + '"></button>' +
                        '<button ' + (obj.readme ? '' : 'disabled="disabled" ') + 'data-adapter-name="' + adapter + '" data-adapter-url="' + obj.readme + '" class="adapter-readme-submit td-button" title="' + _('readme') + '"></button>' +
                        ((that.main.config.expertMode) ? '<button data-adapter-name="' + adapter + '" class="adapter-upload-submit td-button">' + _('upload') + '</button>' : '') +
                        '<button ' + (installed ? '' : 'disabled="disabled" ') + 'data-adapter-name="' + adapter + '" class="adapter-delete-submit td-button" title="' + _('delete adapter') + '"></button>' +
                        ((that.main.config.expertMode) ? '<button data-adapter-name="' + adapter + '" class="adapter-update-custom-submit td-button" title="' + _('install specific version') + '"></button>' : ''),
                        // platform:   obj.platform, actually there is only one platform
                        group:      group,
                        license:    obj.license || '',
                        licenseUrl: obj.licenseUrl || ''
                    };

                    if (!obj.type) console.log('"' + adapter + '": "common adapters",');
                    if (obj.type && that.types[adapter]) console.log('Adapter "' + adapter + '" has own type. Remove from admin.');

                    if (!that.isList) {
                        var iGroup = -1;
                        for (var jj = 0; jj < that.tree.length; jj++) {
                            if (that.tree[jj].key === that.data[adapter].group) {
                                iGroup = jj;
                                break;
                            }
                        }
                        if (iGroup < 0) {
                            that.tree.push({
                                title:    _(that.data[adapter].group),
                                desc:     showUploadProgress(group),
                                key:      that.data[adapter].group,
                                folder:   true,
                                expanded: !that.isCollapsed[that.data[adapter].group],
                                children: [],
                                icon:     that.groupImages[that.data[adapter].group]
                            });
                            iGroup = that.tree.length - 1;
                        }
                        that.tree[iGroup].children.push({
                            icon:     icon,
                            title:    that.data[adapter].title || adapter,
                            key:      adapter
                        });
                    } else {
                        that.tree.push({
                            icon:     icon,
                            title:    that.data[adapter].title || adapter,
                            key:      adapter
                        });
                    }
                }
                //that.sortTree();

                if (!that.onlyInstalled && !that.onlyUpdatable) {
                    for (i = 0; i < listNonInstalled.length; i++) {
                        adapter = listNonInstalled[i];

                        obj = repository[adapter];
                        if (!obj || obj.controller) continue;
                        version = '';
                        if (installedList && installedList[adapter]) continue;

                        if (repository[adapter] && obj.version) {
                            version = obj.version;
                            version = getVersionString(version);
                        }

                        var group = (obj.type || that.types[adapter] || 'common adapters') + '_group';
                        var desc = (typeof obj.desc === 'object') ? (obj.desc[systemLang] || obj.desc.en) : obj.desc;
                        desc += showUploadProgress(group, adapter, that.main.states['system.adapter.' + adapter + '.upload'] ? that.main.states['system.adapter.' + adapter + '.upload'].val : 0);

                        title = (typeof obj.title === 'object') ? (obj.title[systemLang] || obj.title.en) : obj.title;

                        that.data[adapter] = {
                            image:      obj.extIcon ? '<img onerror="this.src=\'img/info-big.png\';" src="' + obj.extIcon + '" class="adapter-table-icon" />' : '',
                            icon:       obj.extIcon,
                            stat:       obj.stat,
                            name:       adapter,
                            title:      (title || '').replace('ioBroker Visualisation - ', ''),
                            desc:       desc,
                            keywords:   obj.keywords ? obj.keywords.join(' ') : '',
                            version:    version,
                            bold:       obj.highlight,
                            installed:  '',
                            install: '<button data-adapter-name="' + adapter + '" class="adapter-install-submit td-button">' + _('add instance') + '</button>' +
                            '<button ' + (obj.readme ? '' : 'disabled="disabled" ') + ' data-adapter-name="' + adapter + '" data-adapter-url="' + obj.readme + '" class="adapter-readme-submit td-button">' + _('readme') + '</button>' +
                            '<div style="width: 22px; display: inline-block;">&nbsp;</div>' +
                            '<button disabled="disabled" data-adapter-name="' + adapter + '" class="adapter-delete-submit td-button">' + _('delete adapter') + '</button>' +
                            ((that.main.config.expertMode) ? '<button data-adapter-name="' + adapter + '" class="adapter-update-custom-submit td-button" title="' + _('install specific version') + '"></button>' : ''),
                            // TODO do not show adapters not for this platform
                            // platform:   obj.platform, // actually there is only one platform
                            license:    obj.license || '',
                            licenseUrl: obj.licenseUrl || '',
                            group:      group
                        };

                        if (!obj.type) console.log('"' + adapter + '": "common adapters",');
                        if (obj.type && that.types[adapter]) console.log('Adapter "' + adapter + '" has own type. Remove from admin.');

                        if (!that.isList) {
                            var igroup = -1;
                            for (var j = 0; j < that.tree.length; j++){
                                if (that.tree[j].key === that.data[adapter].group) {
                                    igroup = j;
                                    break;
                                }
                            }
                            if (igroup < 0) {
                                that.tree.push({
                                    title:    _(that.data[adapter].group),
                                    key:      that.data[adapter].group,
                                    folder:   true,
                                    expanded: !that.isCollapsed[that.data[adapter].group],
                                    children: [],
                                    icon:     that.groupImages[that.data[adapter].group]
                                });
                                igroup = that.tree.length - 1;
                            }
                            that.tree[igroup].children.push({
                                title:    that.data[adapter].title || adapter,
                                icon:     obj.extIcon,
                                desc:     showUploadProgress(group),
                                key:      adapter
                            });
                        } else {
                            that.tree.push({
                                icon:     obj.extIcon,
                                title:    that.data[adapter].title || adapter,
                                key:      adapter
                            });
                        }
                    }
                }

                if (that.currentOrder === 'popular') {
                    var akeys = Object.keys(that.data);
                    akeys.sort(function (a, b) {
                        if (that.data[a].stat > that.data[b].stat) return -1;
                        if (that.data[a].stat < that.data[b].stat) return 1;
                        return 0;
                    });
                    var newData = {};
                    for (var u = 0; u < akeys.length; u++) {
                        newData[akeys[u]] = that.data[akeys[u]];
                    }
                    that.data = newData;
                }

                // build tiles
                if (that.isTiles) {
                    var text = '';
                    var types = [];
                    for (var a in that.data) {
                        if (!that.data.hasOwnProperty(a)) continue;
                        var ad = that.data[a];
                        if (types.indexOf(ad.group) === -1) {
                            types.push(ad.group);
                        }
                        text += '<div class="tile class-' + ad.group + '" data-id="' + ad.name + '">';
                        text += '    <div class="title">' + ad.title + '</div>';
                        if (that.currentOrder === 'popular' && ad.stat) {
                            text += '    <div class="stat">' + ad.stat + '</div>';
                        }
                        text += '    <img onerror="this.src=\'img/info-big.png\';" class="icon" src="' + ad.icon + '" />';
                        text += '    <div class="desc">' + ad.desc + '</div>';
                        text += '    <div class="version"><table><tr><td>' + ad.version + (ad.installed ? '</td><td class="installed">' + ad.rawInstalled : '')  + '</td></tr></table></div>';
                        text += '    <div class="buttons">' + ad.install + '</div>';
                        text += '</div>';
                    }
                    that.$tiles.html(text);
                    // init buttons
                    for (var b in that.data) {
                        if (that.data.hasOwnProperty(b)) {
                            that.initButtons(b);
                        }
                    }

                    var tTypes = '<li class="main-toolbar-table-types-item" data-type=""><a>' + _('all') + '</a></li>\n';
                    for (var g = 0; g < types.length; g++) {
                        tTypes += '<li class="main-toolbar-table-types-item" data-type="' + types[g] + '"><a>' + _(types[g]) + '</a></li>\n';
                    }
                    var $types = $('#main-toolbar-table-types');
                    $types.html(tTypes);
                    $types.find('.main-toolbar-table-types-item').click(function () {
                        that.currentType = $(this).data('type') || '';
                        filterTiles();
                        that.$tab.find('#main-toolbar-table-types-btn').html(_(that.currentType || 'all'));
                        that.main.saveConfig('adaptersCurrentType', that.currentType);
                    });
                    that.$tab.find('#main-toolbar-table-types-btn').html(_(that.currentType || 'all')).dropdown({
                        constrainWidth: false, // Does not change width of dropdown to that of the activator
                        // hover: true, // Activate on hover
                        gutter: 0
                    });

                    $types = $('#main-toolbar-table-order');
                    $types.find('.main-toolbar-table-order-item').click(function () {
                        that.currentOrder = $(this).data('type') || '';
                        //filterTiles();
                        that.$tab.find('#main-toolbar-table-order-btn').html(_(that.currentOrder || 'a-z'));
                        that.main.saveConfig('adaptersCurrentOrder', that.currentOrder);
                        that._postInit();
                    });
                    that.$tab.find('#main-toolbar-table-order-btn').html(_(that.currentOrder || 'a-z')).dropdown({
                        constrainWidth: false, // Does not change width of dropdown to that of the activator
                        // hover: true, // Activate on hover
                        gutter: 0
                    });

                    filterTiles();
                } else {
                    // build tree
                    that.$grid.fancytree('getTree').reload(that.tree);
                    that.$grid.find('.fancytree-icon').each(function () {
                        if ($(this).attr('src')) {
                            $(this).css({width: 18, height: 18});
                        }

                        $(this).hover(function () {
                            var text = '<div class="icon-large" style="' +
                                'left: ' + Math.round($(this).position().left + $(this).width() + 5) + 'px;"><img src="' + $(this).attr('src') + '"/></div>';
                            var $big = $(text);
                            $big.insertAfter($(this));
                            $(this).data('big', $big[0]);
                            var h = parseFloat($big.height());
                            var top = Math.round($(this).position().top - ((h - parseFloat($(this).height())) / 2));
                            if (h + top > (window.innerHeight || document.documentElement.clientHeight)) {
                                top = (window.innerHeight || document.documentElement.clientHeight) - h;
                            }
                            $big.css({top: top});

                        }, function () {
                            var big = $(this).data('big');
                            $(big).remove();
                            $(this).data('big', undefined);
                        });
                    });

                    if (that.currentFilter) {
                        that.$grid.fancytree('getTree').filterNodes(customFilter, false);
                    }

                    that.sortTree();
                    that.enableColResize();
                }
                that.$tab.find('.process-adapters').hide();
            });
        } else {
            this.enableColResize();
        }
    };

    // ----------------------------- Adapters show and Edit ------------------------------------------------
    this.init = function (update, updateRepo) {
        if (this.inited && !update) {
            return;
        }

        if (!this.main.objectsLoaded) {
            setTimeout(function () {
                that.init(update, updateRepo);
            }, 250);
            return;
        }

        // update info
        // Required is list of hosts and repository (done in getAdaptersInfo)
        if (!this.inited) {
            this.inited = true;
            this.main.subscribeObjects('system.host.*');
            this.main.subscribeStates('system.host.*');
        }
        this.main.tabs.hosts.getHosts(function () {
            that._postInit(update, updateRepo);
        });
    };

    this.destroy = function () {
        if (this.inited) {
            this.inited = false;
            this.main.unsubscribeObjects('system.host.*');
            this.main.unsubscribeStates('system.host.*');
        }
    };

    function showLicenseDialog(adapter, callback) {
        var $dialogLicense = $('#dialog-license');
        // Is adapter installed
        if (that.data[adapter].installed || !that.data[adapter].licenseUrl) {
            callback(true);
            return;
        }
        $dialogLicense.find('#license_language').hide();
        $dialogLicense.find('#license_diag').hide();
        $dialogLicense.find('#license_language_label').hide();
        $dialogLicense.find('#license_checkbox').hide();

        var timeout = setTimeout(function () {
            timeout = null;
            callback(true);
        }, 10000);

        if (!that.data[adapter].licenseUrl) {
            that.data[adapter].licenseUrl = 'https://raw.githubusercontent.com/ioBroker/ioBroker.' + template.common.name + '/master/LICENSE';
        }
        if (typeof that.data[adapter].licenseUrl === 'object') {
            that.data[adapter].licenseUrl = that.data[adapter].licenseUrl[systemLang] || that.data[adapter].licenseUrl.en;
        }
        // Workaround
        // https://github.com/ioBroker/ioBroker.vis/blob/master/LICENSE =>
        // https://raw.githubusercontent.com/ioBroker/ioBroker.vis/master/LICENSE
        if (that.data[adapter].licenseUrl.indexOf('github.com') !== -1) {
            that.data[adapter].licenseUrl = that.data[adapter].licenseUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }

        that.main.socket.emit('httpGet', that.data[adapter].licenseUrl, function (error, response, body) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;

                if (!error && body) {
                    $dialogLicense.css({'z-index': 200});
                    body = body.toString().replace(/\r\n/g, '<br>');
                    body = body.replace(/\n/g, '<br>');
                    $dialogLicense.find('#license_text').html(body);

                    $dialogLicense.modal({
                        dismissible: false,
                        complete: function () {
                            $('#license_text').html('');
                        }
                    }).modal('open');
                    $('#license_agree').unbind('click').click(function (e) {
                        if (callback) {
                            callback(true);
                            callback = null;
                        }
                        $('#license_agree').unbind('click');
                        $('#license_non_agree').unbind('click');
                    });
                    $('#license_non_agree').unbind('click').click(function (e) {
                        if (callback) {
                            callback(false);
                            callback = null;
                        }
                        $('#license_agree').unbind('click');
                        $('#license_non_agree').unbind('click');
                    });
                } else {
                    callback && callback(true);
                    callback = null;
                }
            }
        });
    }

    this.initButtons = function (adapter) {
        this.$tab.find('.adapter-install-submit[data-adapter-name="' + adapter + '"]').button({
            text: false,
            icons: {
                primary: 'ui-icon-plusthick'
            }
        }).css(xytdButton).unbind('click').on('click', function () {
            var adapter = $(this).attr('data-adapter-name');
            that.getAdaptersInfo(that.main.currentHost, false, false, function (repo, installed) {
                var obj = repo[adapter];

                if (!obj) obj = installed[adapter];

                if (!obj) return;

                if (obj.license && obj.license !== 'MIT') {
                    // Show license dialog!
                    showLicenseDialog(adapter, function (isAgree) {
                        if (isAgree) {
                            that.main.cmdExec(null, 'add ' + adapter, function (exitCode) {
                                if (!exitCode) that._postInit(true);
                            });
                        }
                    });
                } else {
                    that.main.cmdExec(null, 'add ' + adapter, function (exitCode) {
                        if (!exitCode) that._postInit(true);
                    });
                }
            });
        });

        this.$tab.find('.adapter-delete-submit[data-adapter-name="' + adapter + '"]').button({
            icons: {primary: 'ui-icon-trash'},
            text:  false
        }).css(xytdButton).unbind('click').on('click', function () {
            var name = $(this).attr('data-adapter-name');
            that.main.confirmMessage(_('Are you sure you want to delete adapter %s?', name), _('Please confirm'), 'help', function (result) {
                if (result) {
                    that.main.cmdExec(null, 'del ' + name, function (exitCode) {
                        if (!exitCode) that._postInit(true);
                    });
                }
            });
        });

        this.$tab.find('.adapter-readme-submit[data-adapter-name="' + adapter + '"]').button({
            icons: {primary: 'ui-icon-help'},
            text: false
        }).css(xytdButton).unbind('click').on('click', function () {
            that.main.navigate({
                tab:    'adapters',
                dialog: 'readme',
                params:  $(this).data('adapter-name')
            });
        });

        this.$tab.find('.adapter-update-submit[data-adapter-name="' + adapter + '"]').button({
            icons: {primary: 'ui-icon-refresh'},
            text:  false
        }).css(xytdButton).unbind('click').on('click', function () {
            var aName = $(this).attr('data-adapter-name');
            if (aName === 'admin') that.main.waitForRestart = true;

            that.main.cmdExec(null, 'upgrade ' + aName, function (exitCode) {
                if (!exitCode) that._postInit(true);
            });
        });

        this.$tab.find('.adapter-upload-submit[data-adapter-name="' + adapter + '"]').button({
            icons: {primary: 'ui-icon-arrowthickstop-1-s'},
            text:  false
        }).css(xytdButton).unbind('click').on('click', function () {
            var aName = $(this).attr('data-adapter-name');

            that.main.cmdExec(null, 'upload ' + aName, function (exitCode) {
                if (!exitCode) that._postInit(true);
            });
        });

        var $button = this.$tab.find('.adapter-update-custom-submit[data-adapter-name="' + adapter + '"]');
        $button.button({
            text: false,
            icons: {
                primary: ' ui-icon-triangle-1-s'
            }
        }).css(xytdButton).unbind('click').on('click', function () {
            var versions = [];
            if (that.main.objects['system.adapter.' + adapter].common.news) {
                var news = that.main.objects['system.adapter.' + adapter].common.news;
                for (var id in news) {
                    if (news.hasOwnProperty(id)) {
                        versions.push(id);
                    }
                }
            } else {
                versions.push(that.main.objects['system.adapter.' + adapter].common.version);
            }
            var menu = '';
            for (var v = 0; v < versions.length; v++) {
                menu += '<li data-version="' + versions[v] + '" data-adapter-name="' + $(this).data('adapter-name') + '" class="adapters-versions-link"><b>' + versions[v] + '</b></li>';
            }
            menu += '<li class="adapters-versions-link">' + _('Close') + '</li>';

            var $adaptersMenu = $('#adapters-menu');
            if ($adaptersMenu.data('inited')) $adaptersMenu.menu('destroy');

            var pos = $(this).offset();
            $adaptersMenu.html(menu);
            if (!$adaptersMenu.data('inited')) {
                $adaptersMenu.data('inited', true);
                $adaptersMenu.mouseleave(function () {
                    $(this).hide();
                });
            }

            $adaptersMenu.menu().css({
                left:   pos.left - $adaptersMenu.width(),
                top:    pos.top
            }).show();

            that.$tab.find('.adapters-versions-link').unbind('click').click(function () {
                //if ($(this).data('link')) window.open($(this).data('link'), $(this).data('instance-id'));
                var adapter = $(this).data('adapter-name');
                var version = $(this).data('version');
                if (version && adapter) {
                    that.main.cmdExec(null, 'upgrade ' + adapter + '@' + version, function (exitCode) {
                        if (!exitCode) that._postInit(true);
                    });
                }

                $('#adapters-menu').hide();
            });
        });

        if (!that.main.objects['system.adapter.' + adapter]) {
            $button.button('disable');
        }
    };

    this.objectChange = function (id, obj) {
        // Update Adapter Table
        if (id.match(/^system\.adapter\.[a-zA-Z0-9-_]+$/)) {
            if (obj) {
                if (this.list.indexOf(id) === -1) this.list.push(id);
            } else {
                var j = this.list.indexOf(id);
                if (j !== -1) {
                    this.list.splice(j, 1);
                }
            }

            if (typeof this.$grid !== 'undefined' && this.$grid[0]._isInited) {
                this.init(true);
            }
        }
    };

    function showUploadProgress(group, adapter, percent) {
        var text = '';
        var opened;
        if (adapter || typeof group === 'string') {
            if (adapter) {
                text += '<div class="adapter-upload-progress" data-adapter-name="' + adapter + '"';
            } else {
                text += '<div class="group-upload-progress"';
            }
            text += ' data-adapter-group="' + group + '" style="position: absolute; width: 100%; height: 100%; opacity: ' + (percent ? 0.7 : 0) + '; top: 0; left: 0">';
            opened = true;
        } else {
            percent = group;
            group = null;
        }
        //percent = 80;
        if (percent) {
            text +=
                '<table style="height: 3px; " title="' + _('Upload') + ' ' + percent + '%" class="no-space" style="width:100%; height: 100%; opacity: 0.7">' +
                    '<tr style="height: 100%" class="no-space">' +
                        '<td class="no-space" style="width:' + percent + '%;background: blue"></td>' +
                        '<td style="width:' + (100 - percent) + '%;opacity: 0.1" class="no-space"></td>' +
                    '</tr>' +
                '</table>'
            ;
        }
        //text += percent ? '<table title="' + _('Upload') + ' ' + percent + '%" class="no-space" style="width:100%; height: 100%; opacity: 0.7"><tr style="height: 100%" class="no-space"><td class="no-space" style="width:' + percent + '%;background: blue"></td><td style="width:' + (100 - percent) + '%;opacity: 0.1" class="no-space"></td></tr></table>' : '';

        if (opened) {
            text += '</div>';
        }
        return text;
    }

    this.stateChange = function (id, state) {
        if (id && state) {
            var adapter = id.match(/^system\.adapter\.([\w\d-]+)\.upload$/);
            if (adapter) {
                var $adapter = this.$tab.find('.adapter-upload-progress[data-adapter-name="' + adapter[1] + '"]');
                var text = showUploadProgress(state.val);
                $adapter.html(text).css({opacity: state.val ? 0.7 : 0});
                this.$tab.find('.group-upload-progress[data-adapter-group="' + $adapter.data('adapter-group') + '"]').html(text).css({opacity: state.val ? 0.7 : 0});
            }
        }
    };
}
