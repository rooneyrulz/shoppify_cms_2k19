$(document).ready(() => {
  // Remove Alerts
  $('.alert .alert-close').click(e => {
    const alert = $(e.target).parent();
    alert.fadeOut(800);
  });
});
