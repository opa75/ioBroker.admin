import withWidth from '@material-ui/core/withWidth';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';

// icons
import IconCancel from '@material-ui/icons/Close';
import IconDeleteOne from '@material-ui/icons/Delete';
import IconDeleteAll from '@material-ui/icons/Delete';

import ObjectBrowser from '../components/ObjectBrowser';
import ObjectCustomDialog from '../dialogs/ObjectCustomDialog';
import Router from '@iobroker/adapter-react/Components/Router';
import ObjectBrowserValue from '../components/Object/ObjectBrowserValue';
import ObjectBrowserEditObject from '../components/Object/ObjectBrowserEditObject';
import ObjectBrowserEditRole from '../components/Object/ObjectBrowserEditRole';
import ObjectAddNewObject from '../dialogs/ObjectAddNewObject';
import ObjectEditOfAccessControl from '../dialogs/ObjectEditOfAccessControl';
import ObjectViewFileDialog from '../dialogs/ObjectViewFileDialog';

const styles = theme => ({
    buttonIcon: {
        marginRight: 4,
    },
    buttonAll: {
        color: '#FF0000',
    },
    id: {
        fontStyle: 'italic',
    },
    buttonText: {
        whiteSpace: 'nowrap'
    }
});
class Objects extends Component {

    constructor(props) {

        super(props);

        this.dialogName = 'AdminObjects';

        this.filters = window.localStorage.getItem(`${this.dialogName || 'App'}.filters`) || '{}';

        try {
            this.filters = JSON.parse(this.filters);
        } catch (e) {
            this.filters = {};
        }

        let selected = window.localStorage.getItem(`${this.dialogName || 'App'}.selected`) || '';

        this.state = {
            selected: this.props.selected === undefined ? selected : '',
            name: '',
            toast: '',
            deleteObjectShow: null,
            //suppressDeleteConfirm: false,
        };
        this.t = this.translate;
        this.wordCache = {};
    }

    translate = (word, arg1, arg2) => {
        if (arg1 !== undefined) {
            return this.props.t(word, arg1, arg2);
        }

        if (!this.wordCache[word]) {
            this.wordCache[word] = this.props.t(word);
        }

        return this.wordCache[word];
    }

    onDelete(withChildren) {
        const id = this.state.deleteObjectShow.id;
        if (withChildren) {
            this.props.socket.delObjects(id, true)
                .then(() => this.setState({ toast: this.t('All deleted') }))
                .catch(e => window.alert('Cannot delete object: ' + e));

            this.setState({ deleteObjectShow: null });
        } else {
            this.props.socket.delObject(id, false)
                .catch(e => window.alert('Cannot delete object: ' + e));
            this.setState({ deleteObjectShow: null })
        }
    }

    renderToast() {
        return <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            open={!!this.state.toast}
            autoHideDuration={3000}
            onClose={() => this.setState({ toast: '' })}
            message={this.state.toast}
            action={
                <React.Fragment>
                    <IconButton size="small" aria-label="close" color="inherit" onClick={() => this.setState({ toast: '' })}>
                        <IconCancel fontSize="small" />
                    </IconButton>
                </React.Fragment>
            }
        />;
    }

    renderDeleteDialog() {
        if (!this.state.deleteObjectShow) {
            return null;
        } else {
            return <Dialog
                key="delete"
                maxWidth="md"
                open={true}
                onClose={() => this.setState({ deleteObjectShow: null })}
                aria-labelledby="delete-object-dialog-title"
                aria-describedby="delete-object-dialog-description"
            >
                <DialogTitle id="delete-object-dialog-title">{this.state.deleteObjectShow.hasChildren ? this.t('Delete object(s)') : this.t('Delete object')}: <span className={this.props.classes.id}>{this.state.deleteObjectShow.id}</span></DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {this.t('Are you sure?')}
                        {/*<FormControlLabel
                            control={<Checkbox
                                checked={this.state.suppressDeleteConfirm}
                                onChange={() => {
                                    this.setState({suppressDeleteConfirm: true});

                                }}
                                name="checkedA" />
                            }
                            label="Secondary"
                        />*/}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    {this.state.deleteObjectShow.hasChildren ? <Button variant="contained" classes={{label: this.props.classes.buttonText}} onClick={() => this.onDelete(true)} startIcon={<IconDeleteAll className={this.props.classes.buttonAll} />}>{this.t('Delete with children')}</Button> : null}
                    {this.state.deleteObjectShow.exists ? <Button variant="contained" classes={{label: this.props.classes.buttonText}} onClick={() => this.onDelete(false)} color="primary" startIcon={<IconDeleteOne />} autoFocus>{this.t('Delete one item')}</Button> : null}
                    <Button variant="contained" onClick={() => this.setState({ deleteObjectShow: null })} startIcon={<IconCancel />}>{this.t('ra_Cancel')}</Button>
                </DialogActions>
            </Dialog>;
        }
    }

    render() {
        return [
            <ObjectBrowser
                key="browser"
                dialogName="admin"
                objectsWorker={this.props.objectsWorker}
                prefix={this.props.prefix}
                defaultFilters={this.filters}
                statesOnly={this.props.statesOnly}
                style={{ width: '100%', height: '100%' }}
                socket={this.props.socket}
                selected={this.state.selected}
                name={this.state.name}
                expertMode={this.props.expertMode}
                isFloatComma={this.props.isFloatComma}
                dateFormat={this.props.dateFormat}
                t={this.t}
                lang={this.props.lang}
                themeName={this.props.themeName}
                themeType={this.props.themeType}
                theme={this.props.theme}
                objectCustomDialog={ObjectCustomDialog}
                objectBrowserValue={ObjectBrowserValue}
                objectBrowserEditObject={ObjectBrowserEditObject}
                objectBrowserEditRole={ObjectBrowserEditRole}
                objectBrowserViewFile={ObjectViewFileDialog}
                router={Router}
                enableStateValueEdit={true}
                onObjectDelete={(id, hasChildren, exists) =>
                    this.setState({ deleteObjectShow: { id, hasChildren, exists } })}
                onFilterChanged={filterConfig => {
                    this.filters = filterConfig;
                    window.localStorage.setItem(`${this.dialogName || 'App'}.filters`, JSON.stringify(filterConfig));
                }}
                onSelect={selected =>
                    window.localStorage.setItem(`${this.dialogName || 'App'}.selected`, selected[0] || '')}
                objectEditBoolean
                objectAddBoolean
                objectStatesView
                objectImportExport
                objectEditOfAccessControl
                modalNewObject={context =>
                    <ObjectAddNewObject
                        objects={context.objects}
                        expertMode={this.props.expertMode}
                        open={context.state.modalNewObj}
                        setObject={(id, data) => context.setObject(id, data)}
                        selected={context.state.selected[0] || context.state.selectedNonObject}
                        onClose={() => context.setState({ modalNewObj: false })}
                        onApply={() => context.setState({ modalNewObj: false })} />
                }
                modalEditOfAccessControl={(context, objData) =>
                    <ObjectEditOfAccessControl
                        themeType={this.props.themeType}
                        open={context.state.modalEditOfAccess}
                        extendObject={(id, data) => {
                            context.extendObject(id, data);
                            objData.aclTooltip = null;
                        }}
                        selected={context.state.selected[0]}
                        modalEmptyId={context.state.modalEmptyId}
                        objects={context.objects}
                        t={this.t}
                        onClose={() => context.setState({ modalEditOfAccess: false, modalEditOfAccessObjData: null, modalEmptyId: null })}
                        onApply={() => context.setState({ modalEditOfAccess: false, modalEditOfAccessObjData: null, modalEmptyId: null })} />
                }
            />,
            this.renderDeleteDialog()
        ];
    }
}

Objects.propTypes = {
    t: PropTypes.func,
    lang: PropTypes.string,
    socket: PropTypes.object,
    themeName: PropTypes.string,
    themeType: PropTypes.string,
    theme: PropTypes.object,
    expertMode: PropTypes.bool,
    isFloatComma: PropTypes.bool,
    dateFormat: PropTypes.string,
    objectsWorker: PropTypes.object,
};

/** @type {typeof Objects} */
const _export = withWidth()(withStyles(styles)(Objects));
export default _export;
