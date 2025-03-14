import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import TextFieldsIcon from '@material-ui/icons/TextFields';
import DescriptionIcon from '@material-ui/icons/Description';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import PageviewIcon from '@material-ui/icons/Pageview';
import ColorLensIcon from '@material-ui/icons/ColorLens';
import ImageIcon from '@material-ui/icons/Image';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';

import {IOTextField, IOColorPicker} from '../IOFields/Fields';

import Utils from '@iobroker/adapter-react/Components/Utils';
import IconPicker from '@iobroker/adapter-react/Components/IconPicker';

const styles = theme => ({
    contentRoot:{
        padding: '16px 24px'
    },
    dialogTitle: {
        borderBottom: '1px solid #00000020',
        padding : 0,
        width:'100%'
    },
    dialogActions: {
        borderTop: '1px solid #00000020',
        width:'100%'
    },
    dialog: {
    },
    iconPreview: {
        height: 32,
        width: 32,
    },
    colorPicker: {
    },
    formIcon : {
        margin: 10,
        opacity: 0.6
    },
    formContainer : {
        display: 'flex',
        justifyContent:'center',
        alignItems:'center'
    },
    formControl : {
        display: 'flex',
        padding: '0 0 24px 0',
        flexGrow: 1000
    },
});

function EnumEditDialog(props) {
    let idExists = props.enums.find(enumItem => enumItem._id === props.enum._id);

    let canSave = props.enum._id !== 'system.enum.';

    if (props.isNew && idExists) {
        canSave = false;
    }

    const getShortId = _id => _id.split('.').pop();

    const name2Id = name =>
        name.replace(Utils.FORBIDDEN_CHARS, '_').replace(/\s/g, '_').replace(/\./g, '_');

    const changeShortId = (_id, short) => {
        let idArray = _id.split('.');
        idArray[idArray.length-1] = short;
        return idArray.join('.');
    }

    return <Dialog
        fullWidth={props.innerWidth < 500}
        open={true}
        onClose={(event, reason) => {
            if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                props.onClose();
            }
        }}
    >
        <DialogTitle className={props.classes.dialogTitle} style={{padding: 12}} >
           { props.t( 'Enum parameters' ) }
        </DialogTitle>
        <DialogContent classes={{root: props.classes.contentRoot}}>
            <Grid container spacing={2} className={props.classes.dialog}>
                <Grid item xs={12} md={6}>
                    <IOTextField
                        label="Name"
                        t={props.t}
                        value={ props.getName(props.enum.common.name) }
                        onChange={e=>{
                            let newData = props.enum;
                            if (!props.enum.common.dontDelete && name2Id(props.getName(newData.common.name)) === getShortId(newData._id)) {
                                newData._id = changeShortId(newData._id, name2Id(e.target.value));
                            }
                            newData.common.name = e.target.value;
                            props.onChange(newData);
                        }}
                        autoComplete="off"
                        icon={TextFieldsIcon}
                        classes={props.classes}
                    />
                </Grid>
                 <Grid item xs={12} md={6}>
                    <IOTextField
                        label="ID edit"
                        t={props.t}
                        disabled={props.enum.common.dontDelete}
                        value={ props.enum._id.split('.')[props.enum._id.split('.').length-1] }
                        onChange={e=>{
                            let newData = JSON.parse(JSON.stringify(props.enum));
                            newData._id = changeShortId(newData._id, name2Id(e.target.value));
                            props.onChange(newData);
                        }}
                        icon={LocalOfferIcon}
                        classes={props.classes}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <IOTextField
                        label="ID preview"
                        t={props.t}
                        disabled
                        value={ props.enum._id }
                        icon={PageviewIcon}
                        classes={props.classes}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <IOTextField
                        label="Description"
                        t={props.t}
                        value={ props.enum.common.desc }
                        onChange={e=>{
                            let newData = props.enum;
                            newData.common.desc = e.target.value;
                            props.onChange(newData);
                        }}
                        icon={DescriptionIcon}
                        classes={props.classes}
                    />
                </Grid>
                 <Grid item xs={12} md={6}>
                    <IconPicker
                        label="Icon"
                        onlyDevices={props.enum._id.startsWith('enum.functions.')}
                        onlyRooms={props.enum._id.startsWith('enum.rooms.')}
                        t={props.t}
                        lang={props.lang}
                        value={ props.enum.common.icon }
                        onChange={fileBlob=>{
                            let newData = props.enum;
                            newData.common.icon = fileBlob;
                            props.onChange(newData);
                        }}
                        previewClassName={props.classes.iconPreview}
                        icon={ImageIcon}
                        classes={props.classes}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <IOColorPicker
                        label="Color"
                        t={props.t}
                        value={ props.enum.common.color }
                        previewClassName={props.classes.iconPreview}
                        onChange={color=>{
                            let newData = props.enum;
                            newData.common.color = color;
                            props.onChange(newData);
                        }}
                        icon={ColorLensIcon}
                        className={props.classes.colorPicker}
                        classes={props.classes}
                    />
                </Grid>
            </Grid>
        </DialogContent>
        <DialogActions className={props.classes.dialogActions} >
            <Button variant="contained" color="primary" autoFocus onClick={() => props.saveData(props.isNew ? null : props.enum._id)} disabled={!canSave || !props.changed}  startIcon={<CheckIcon />}>{props.t('Save')}</Button>
            <Button variant="contained" onClick={props.onClose} startIcon={<CloseIcon />}>{props.t('Cancel')}</Button>
        </DialogActions>
    </Dialog>;
}

EnumEditDialog.propTypes = {
    enum: PropTypes.object,
    enums: PropTypes.array,
    isNew: PropTypes.bool,
    onChange: PropTypes.func,
    saveData: PropTypes.func,
    onClose: PropTypes.func,
    changed: PropTypes.bool,
    classesParent: PropTypes.object,
    t: PropTypes.func,
    lang: PropTypes.string,
    socket: PropTypes.object,
};

export default withStyles(styles)(EnumEditDialog);