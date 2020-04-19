import React, { Component } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Asset } from 'expo-asset';
// import * as ImageManipulator from 'expo-image-manipulator';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import ImageManipulator from '../manipulator/ImageManipulator';

// const text = require('../assets/text.jpg');

class Stepper extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isVisible: true,
			uri: null,

			width: null,
			height: null,
		};
	}

	onToggleModal = () => {
		const { isVisible } = this.state;
		this.setState({ isVisible: !isVisible });
	};

	async componentDidMount() {
		const textImage = await Asset.fromModule(require('../assets/text.jpg'));

		console.log('Text Image: ', textImage);
		this.setState({ uri: textImage.uri }, () => {
			console.log('Uri: ', this.state.uri);
			// Image.getSize(
			// this.state.uri,
			// (w, h) => {
			// console.log('Width and Height: ', w, h);
			// this.setState({width: w, height: h})
			// },
			// (e) => console.log('Error: ', e))
		});
	}

	static navigationOptions = {
		header: null,
	};

	defaultScrollViewProps = {
		keyboardShouldPersistTaps: 'handled',
		contentContainerStyle: {
			flex: 1,
			justifyContent: 'center',
		},
	};

	onPageLayout = (event) => {
		const { width, height } = event.nativeEvent.layout;
		console.log('ON LAYOUT');
		this.setState({ width, height });
	};

	onNextStep = () => {
		console.log('called next step');
	};

	onPrevStep = () => {
		console.log('called previous step');
	};

	onSubmitSteps = () => {
		console.log('called on submit step.');
	};

	// renderSteps = () => {
	// 	const { isVisible } = this.state;
	// 	const { uri } = textImage;
	// 	return (
	// 		<ProgressStep
	// 			label='Name'
	// 			onNext={this.onNextStep}
	// 			onPrevious={this.onPrevStep}
	// 			onSubmit={this.onSubmitStep}
	// 			scrollViewProps={this.defaultScrollViewProps}
	// 		>
	// 			<ImageManipulator
	// 				photo={{ uri }}
	// 				isVisible={isVisible}
	// 				onPictureChoosed={(data) => {
	// 					console.log(data);
	// 				}}
	// 				// fixedMask={{ width: 200, height: 200 }}
	// 				onToggleModal={this.onToggleModal}
	// 				saveOptions={{
	// 					compress: 1,
	// 					format: 'png',
	// 					base64: true,
	// 				}}
	// 				btnTexts={{
	// 					done: 'Ok',
	// 					crop: 'Cut',
	// 					processing: 'Processing',
	// 				}}
	// 			/>
	// 		</ProgressStep>
	// 	);
	// };

	render() {
		const { uri, isVisible, width, height } = this.state;
		// console.log('Uri: ', uri);
		// const { uri } = textImage;
		return (
			<View style={styles.container}>
				<ProgressSteps>
					<ProgressStep
						label='Payment'
						onNext={this.onNextStep}
						onPrevious={this.onPrevStep}
						scrollViewProps={this.defaultScrollViewProps}
					>
						<View style={{ flex: 1 }} onLayout={this.onPageLayout}>
							{uri && (
								<ImageManipulator
									photo={{ uri }}
									isVisible={true}
									onPictureChoosed={(data) => {
										console.log(data);
									}}
									width={width}
									height={height}
									// fixedMask={{ width: 200, height: 200 }}
									onToggleModal={this.onToggleModal}
									saveOptions={{
										compress: 1,
										format: 'png',
										base64: true,
									}}
									btnTexts={{
										done: 'Ok',
										crop: 'Cut',
										processing: 'Processing',
									}}
								/>
							)}
							{/* <Text>ImageManipulator</Text> */}
						</View>
					</ProgressStep>
					<ProgressStep
						label='Shipping Address'
						onNext={this.onNextStep}
						onPrevious={this.onPrevStep}
						scrollViewProps={this.defaultScrollViewProps}
					>
						<View style={{ alignItems: 'center' }}>
							<Text>Shipping address step content</Text>
						</View>
					</ProgressStep>
				</ProgressSteps>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: 50,
	},
});

export default Stepper;
