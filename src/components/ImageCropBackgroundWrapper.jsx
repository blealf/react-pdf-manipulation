/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
	TransformableImage,
	isTouchEvent,
	isWheelEvent,
	useMoveImageOptions,
	useScaleImageOptions,
} from 'react-advanced-cropper';
import { useDebouncedCallback } from 'use-debounce';
import './BackgroundWrapperWithNotifications.css';
import cn from 'classnames';

export const ImageCropBackgroundWrapper = ({
	cropper,
	scaleImage = true,
	moveImage = true,
	children,
	className,
	style,
}) => {
	const moveImageOptions = useMoveImageOptions(moveImage);

	const scaleImageOptions = useScaleImageOptions(scaleImage);

	const transitions = cropper.getTransitions();

	const [notificationType, setNotificationType] = useState<'touch' | 'wheel'>('wheel');

	const [notificationVisible, setNotificationVisible] = useState(false);

	const debouncedHideNotification = useDebouncedCallback(() => {
		setNotificationVisible(false);
	}, 1500);

	const eventsHandler = (event, nativeEvent) => {
		if (isTouchEvent(nativeEvent)) {
			if (nativeEvent.touches.length === 1 && !event.active) {
				setNotificationVisible(true);
				setNotificationType('touch');
				debouncedHideNotification();
				event.preventDefault();
			} else {
				setNotificationVisible(false);
			}
		} else if (isWheelEvent(nativeEvent)) {
			if (!event.active && !nativeEvent.ctrlKey) {
				setNotificationVisible(true);
				setNotificationType('wheel');
				debouncedHideNotification();
				event.preventDefault();
			} else {
				setNotificationVisible(false);
			}
		}
		if (!event.defaultPrevented) {
			nativeEvent.preventDefault();
			nativeEvent.stopPropagation();
		}
	};

	return (
		<TransformableImage
			className={className}
			style={style}
			onTransform={cropper.transformImage}
			onTransformEnd={cropper.transformImageEnd}
			onEvent={eventsHandler}
			touchMove={moveImageOptions.touch}
			mouseMove={moveImageOptions.mouse}
			touchScale={scaleImageOptions.touch}
			wheelScale={scaleImageOptions.wheel}
			disabled={transitions.active}
		>
			{children}
			<div
				className={cn(
					'cropper-event-notification',
					notificationVisible && 'cropper-event-notification--visible',
				)}
			>
				{notificationType === 'wheel'
					? 'Use ctrl + scroll to zoom the cropper'
					: 'Use two fingers to move the cropper'}
			</div>
		</TransformableImage>
	);
};
