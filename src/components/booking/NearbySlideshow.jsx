import StaySlideshowBookingModal from "./StaySlideshowBookingModal";

/**
 * NearbySlideshow
 * Unified Slideshow + Booking System in a Form.
 * Backward compatible with existing props while providing the complete booking system.
 */
function NearbySlideshow({ isOpen, onClose, place, onProceedToBook }) {
  return (
    <StaySlideshowBookingModal
      isOpen={isOpen}
      onClose={onClose}
      place={place}
      onSuccess={onProceedToBook}
    />
  );
}

export default NearbySlideshow;
