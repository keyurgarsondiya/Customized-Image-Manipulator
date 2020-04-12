import React, { Component } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Asset } from 'expo-asset';
// import * as ImageManipulator from 'expo-image-manipulator';
import { ProgressSteps, ProgressStep } from 'react-native-progress-steps';
import ImageManipulator from '../manipulator/ImageManipulator';

// const text = require('../assets/text.jpg');
const textImage = Asset.fromModule(require('../assets/text.jpg'));

class Stepper extends Component {
	constructor(props) {
		super(props);
		this.state = {
			width: null,
			height: null,
			isVisible: true,
		};
	}

	onToggleModal = () => {
		const { isVisible } = this.state;
		this.setState({ isVisible: !isVisible });
	};

	componentDidMount() {
		Image.getSize(
			textImage.uri,
			(w, h) => console.log('Width and Height: ', w, h),
			(e) => console.log('Error: ', e)
		);
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
		console.log('Text Image: ', textImage);
		const { isVisible } = this.state;
		const { uri } = textImage;
		return (
			<View style={styles.container}>
				<ProgressSteps>
					<ProgressStep
						label='Payment'
						onNext={this.onNextStep}
						onPrevious={this.onPrevStep}
						scrollViewProps={this.defaultScrollViewProps}
					>
						<View style={{ flex: 1 }}>
							<ImageManipulator
								photo={{ uri }}
								isVisible={true}
								onPictureChoosed={(data) => {
									console.log(data);
								}}
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
								borderColor='black'
							/>
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
