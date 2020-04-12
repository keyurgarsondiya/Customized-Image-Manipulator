import React, { Component } from 'react';
import {
	Dimensions,
	Image,
	ScrollView,
	Modal,
	View,
	Text,
	SafeAreaView,
	TouchableOpacity,
	YellowBox,
} from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import PropTypes from 'prop-types';
import AutoHeightImage from 'react-native-auto-height-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { isIphoneX } from 'react-native-iphone-x-helper';
import ImageCropOverlay from './ImageCropOverlay';

const { width } = Dimensions.get('window');

YellowBox.ignoreWarnings([
	'componentWillReceiveProps',
	'componentWillUpdate',
	'componentWillMount',
]);
YellowBox.ignoreWarnings([
	'Warning: componentWillMount is deprecated',
	'Warning: componentWillReceiveProps is deprecated',
	'Module RCTImageLoader requires',
]);

class ExpoImageManipulator extends Component {
	constructor(props) {
		super(props);
		this.state = {
			cropMode: false,
			processing: false,
			zoomScale: 1,
			hasError: false,
		};

		this.scrollOffset = 0;

		this.currentPos = {
			left: 0,
			top: 0,
		};

		this.currentSize = {
			width: 0,
			height: 0,
		};

		this.maxSizes = {
			width: 0,
			height: 0,
		};

		this.actualSize = {
			width: 0,
			height: 0,
		};
	}

	setCropMode = () => {
		this.setState({ cropMode: true });
	};

	static getDerivedStateFromError(error) {
		// console.log('Error: ', error);
		return { hasError: true };
	}

	async componentDidMount() {
		await this.onConvertImageToEditableSize();
		this.setCropMode();
	}

	onGetCorrectSizes = (w, h) => {
		const sizes = {
			convertedWidth: w,
			convertedheight: h,
		};
		const ratio = Math.min(1920 / w, 1080 / h);
		sizes.convertedWidth = Math.round(w * ratio);
		sizes.convertedheight = Math.round(h * ratio);
		return sizes;
	};

	async onConvertImageToEditableSize() {
		const {
			photo: { uri: rawUri },
		} = this.props;
		Image.getSize(rawUri, async (imgW, imgH) => {
			const { convertedWidth, convertedheight } = this.onGetCorrectSizes(
				imgW,
				imgH
			);
			const { uri, width: w, height } = await ImageManipulator.manipulateAsync(
				rawUri,
				[
					{
						resize: {
							width: convertedWidth,
							height: convertedheight,
						},
					},
				]
			);
			this.setState({
				uri,
			});
			this.actualSize.width = w;
			this.actualSize.height = height;
		});
	}

	get isRemote() {
		const { uri } = this.state;
		return /^(http|https|ftp)?(?:[:/]*)([a-z0-9.-]*)(?::([0-9]+))?(\/[^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/.test(
			uri
		);
	}

	onToggleModal = () => {
		const { onToggleModal } = this.props;
		onToggleModal();
		this.setState({ cropMode: false });
	};

	onCropImage = () => {
		this.setState({ processing: true });
		const { uri } = this.state;
		Image.getSize(uri, async (actualWidth, actualHeight) => {
			const cropObj = this.getCropBounds(actualWidth, actualHeight);
			if (cropObj.height > 0 && cropObj.width > 0) {
				let uriToCrop = uri;
				if (this.isRemote) {
					const response = await FileSystem.downloadAsync(
						uri,
						FileSystem.documentDirectory + 'image'
					);
					uriToCrop = response.uri;
				}
				const {
					uri: uriCroped,
					base64,
					width: croppedWidth,
					height: croppedHeight,
				} = await this.crop(cropObj, uriToCrop);

				this.actualSize.width = croppedWidth;
				this.actualSize.height = croppedHeight;

				this.setState({
					uri: uriCroped,
					base64,
					cropMode: false,
					processing: false,
				});
			} else {
				this.setState({ cropMode: false, processing: false });
			}
		});
	};

	onHandleScroll = (event) => {
		this.scrollOffset = event.nativeEvent.contentOffset.y;
	};

	getCropBounds = (actualWidth, actualHeight) => {
		const imageRatio = actualHeight / actualWidth;
		let originalHeight = Dimensions.get('window').height - 64;
		if (isIphoneX()) {
			originalHeight = Dimensions.get('window').height - 122;
		}
		const renderedImageWidth =
			imageRatio < originalHeight / width ? width : originalHeight / imageRatio;
		const renderedImageHeight =
			imageRatio < originalHeight / width ? width * imageRatio : originalHeight;

		const renderedImageY = (originalHeight - renderedImageHeight) / 2.0;
		const renderedImageX = (width - renderedImageWidth) / 2.0;

		const renderImageObj = {
			left: renderedImageX,
			top: renderedImageY,
			width: renderedImageWidth,
			height: renderedImageHeight,
		};
		const cropOverlayObj = {
			left: this.currentPos.left,
			top: this.currentPos.top,
			width: this.currentSize.width,
			height: this.currentSize.height,
		};

		let intersectAreaObj = {};

		const x = Math.max(renderImageObj.left, cropOverlayObj.left);
		const num1 = Math.min(
			renderImageObj.left + renderImageObj.width,
			cropOverlayObj.left + cropOverlayObj.width
		);
		const y = Math.max(renderImageObj.top, cropOverlayObj.top);
		const num2 = Math.min(
			renderImageObj.top + renderImageObj.height,
			cropOverlayObj.top + cropOverlayObj.height
		);
		if (num1 >= x && num2 >= y) {
			intersectAreaObj = {
				originX: (x - renderedImageX) * (actualWidth / renderedImageWidth),
				originY: (y - renderedImageY) * (actualWidth / renderedImageWidth),
				width: (num1 - x) * (actualWidth / renderedImageWidth),
				height: (num2 - y) * (actualWidth / renderedImageWidth),
			};
		} else {
			intersectAreaObj = {
				originX: x - renderedImageX,
				originY: y - renderedImageY,
				width: 0,
				height: 0,
			};
		}
		return intersectAreaObj;
	};

	crop = async (cropObj, uri) => {
		const { saveOptions } = this.props;
		if (cropObj.height > 0 && cropObj.width > 0) {
			const manipResult = await ImageManipulator.manipulateAsync(
				uri,
				[
					{
						crop: cropObj,
					},
				],
				saveOptions
			);
			return manipResult;
		}
		return {
			uri: null,
			base64: null,
		};
	};

	async UNSAFE_componentWillReceiveProps() {
		await this.onConvertImageToEditableSize();
	}

	render() {
		const {
			isVisible,
			onPictureChoosed,
			borderColor,
			allowRotate = true,
			allowFlip = true,
			btnTexts,
			fixedMask,
		} = this.props;
		const { uri, base64, cropMode, processing } = this.state;
		console.log('Uri Obtained: ' + uri + ', Crop Mode: ' + cropMode);
		if (
			uri &&
			cropWidth !== 0 &&
			cropHeight !== 0 &&
			originalHeight !== 0 &&
			width !== 0
		) {
			this.setCropMode();
		}

		const imageRatio = this.actualSize.height / this.actualSize.width;
		let originalHeight = Dimensions.get('window').height - 64;
		if (isIphoneX()) {
			originalHeight = Dimensions.get('window').height - 122;
		}

		const cropRatio = originalHeight / width;

		const cropWidth =
			imageRatio < cropRatio ? width : originalHeight / imageRatio;
		const cropHeight =
			imageRatio < cropRatio ? width * imageRatio : originalHeight;

		const cropInitialTop = (originalHeight - cropHeight) / 2.0;
		const cropInitialLeft = (width - cropWidth) / 2.0;

		if (this.currentSize.width === 0 && cropMode) {
			this.currentSize.width = cropWidth;
			this.currentSize.height = cropHeight;

			this.currentPos.top = cropInitialTop;
			this.currentPos.left = cropInitialLeft;
		}
		return this.state.hasError ? (
			<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<Text>Something went Wrong</Text>
			</View>
		) : (
			<View
				style={{
					flex: 1,
					backgroundColor: 'black',
					width: Dimensions.get('window').width,
				}}
			>
				<AutoHeightImage
					style={{ backgroundColor: 'black' }}
					source={{ uri }}
					resizeMode={imageRatio >= 1 ? 'contain' : 'contain'}
					width={width}
					height={originalHeight}
					// onLayout={this.calculateMaxSizes}
				/>
				<ImageCropOverlay
					onLayoutChanged={(top, left, w, height) => {
						this.currentSize.width = w;
						this.currentSize.height = height;
						this.currentPos.top = top;
						this.currentPos.left = left;
					}}
					initialWidth={(fixedMask && fixedMask.width) || cropWidth}
					initialHeight={(fixedMask && fixedMask.height) || cropHeight}
					initialTop={cropInitialTop}
					initialLeft={cropInitialLeft}
					minHeight={(fixedMask && fixedMask.height) || 100}
					minWidth={(fixedMask && fixedMask.width) || 100}
					borderColor={borderColor}
				/>
			</View>
		);
	}
}

export default ExpoImageManipulator;

ExpoImageManipulator.defaultProps = {
	onPictureChoosed: ({ uri, base64 }) => console.log('URI:', uri, base64),
	borderColor: '#a4a4a4',
	btnTexts: {
		crop: 'Crop',
		rotate: 'Rotate',
		done: 'Done',
		processing: 'Processing',
	},
	saveOptions: {
		compress: 1,
		format: ImageManipulator.SaveFormat.PNG,
		base64: false,
	},
	fixedMask: null,
};

ExpoImageManipulator.propTypes = {
	borderColor: PropTypes.string,
	isVisible: PropTypes.bool.isRequired,
	onPictureChoosed: PropTypes.func,
	btnTexts: PropTypes.object,
	fixedMask: PropTypes.object,
	saveOptions: PropTypes.object,
	photo: PropTypes.object.isRequired,
	onToggleModal: PropTypes.func.isRequired,
};
