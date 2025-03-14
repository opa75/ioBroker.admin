import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Fab from '@material-ui/core/Fab';

// Icons
import CloseIcon from '@material-ui/icons/Close';
import PlayIcon from '@material-ui/icons/PlayArrow';
import DownloadIcon from '@material-ui/icons/GetApp';

const styles = theme => ({
    dialog: {
        height: '100%',
        maxHeight: '100%',
        maxWidth: '100%',
    },
    content: {
        textAlign: 'center',
    },
    tabPanel: {
        width: '100%',
        overflow: 'hidden',
        height: 'calc(100% - ' + theme.mixins.toolbar.minHeight + 'px)',
    },
    error: {
        color: theme.palette.type === 'dark' ? '#ff7777' : '#c20000'
    },
    image: {
        height: '100%',
        width: 'auto'
    },
    text: {
        fontFamily: 'Lucida Console, Courier, monospace',
        width: '100%'
    },
    download: {
        textDecoration: 'none',
        textTransform: 'uppercase',
        fontSize: 14,
        color: 'white',
        border: '1px solid white',
        borderRadius: 5,
        padding: '8px 16px',
    }
});

export const EXTENSIONS = {
    images: ['png', 'jpg', 'svg', 'jpeg'],
    code: ['js', 'json'],
    txt: ['log', 'txt', 'html', 'css', 'xml'],
};

class ObjectViewFileDialog extends Component {
    constructor(props) {
        super(props);

        const parts = this.props.obj._id.split('.');

        this.state = {
            error: '',
            sound: null,
            image: null,
            text: null,
            binary: null,
            fileName: parts[parts.length - 2] + '.' + parts[parts.length - 1]
        };

        this.audioRef = React.createRef();
    }

    componentDidMount() {
        this.props.socket.getBinaryState(this.props.obj._id)
            .then(data => {
                console.log('Data: ' + data);
                const ext = this.props.obj._id.toLowerCase().split('.').pop();

                if (ext === 'jpg') {
                    this.setState({image: true, binary: data, mime: 'image/jpeg'});
                } else if (ext === 'svg') {
                    this.setState({image: true, binary: data, mime: 'image/svg+xml'});
                } else if (ext === 'png' || ext === 'bmp') {
                    this.setState({image: true, binary: data, mime: 'image/' + ext});
                } else if (ext === 'mp3') {
                    this.setState({audio: true, binary: data, mime: 'audio/mpeg'});
                } else if (ext === 'ogg') {
                    this.setState({audio: true, binary: data, mime: 'audio/ogg'});
                } else if (ext === 'txt' || ext === 'log') {
                    try {
                        const text = btoa(data);
                        this.setState({text, binary: data, mime: 'text/plain'});
                    } catch (error) {
                    }
                }
            })
            .catch(error => this.setState({error}));
    }

    render() {
        return <Dialog
            className={this.props.classes.dialog}
            open={true}
            maxWidth={ this.state.audio ? 'sm' : 'md'}
            onClose={() => this.props.onClose()}
            fullWidth={true}
            aria-labelledby="object-view-dialog-title"
        >
            <DialogTitle id="object-view-dialog-title">{
                this.props.t('View file in state: %s', this.props.obj._id)
            }</DialogTitle>
            <DialogContent className={this.props.classes.content}>
                { this.state.error ? <div className={this.props.classes.error}>{this.state.error === 'State is not binary' ? this.props.t('No file stored yet') : this.props.t(this.state.error)}</div> : null}
                { this.state.audio ? <audio ref={this.audioRef} src={ `data:${this.state.mime};base64,${this.state.binary}` }/> : null }
                { this.state.audio ? <Fab color="primary" onClick={() => this.audioRef.current && this.audioRef.current.play()}>
                    <PlayIcon />
                </Fab> : null }
                { this.state.image ? <img src={`data:${this.state.mime};base64,${this.state.binary}`} alt={this.props.obj._id} className={this.props.classes.image}/> : null}
                { this.state.text !== null ? <pre className={this.props.classes.text}>{this.state.text}</pre> : null}
            </DialogContent>
            <DialogActions>
                <a className={this.props.classes.download} download={this.state.fileName} href={ `data:${this.state.mime};base64,${this.state.binary}` }>
                    <DownloadIcon style={{paddingRight: 8, height: 12}}/>
                    <span >{this.props.t('Download')}</span>
                </a>
                <Button
                    variant="contained"
                    onClick={() => this.props.onClose()}
                    startIcon={<CloseIcon />}
                >
                    {this.props.t('Close')}
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

ObjectViewFileDialog.propTypes = {
    t: PropTypes.func,
    lang: PropTypes.string,
    expertMode: PropTypes.bool,
    socket: PropTypes.object,
    themeType: PropTypes.string,
    obj: PropTypes.object,
    onClose: PropTypes.func.isRequired,
};

export default withWidth()(withStyles(styles)(ObjectViewFileDialog));
