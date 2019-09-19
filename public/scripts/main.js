$(document).ready(() => {
  // Remove Alerts
  $('.alert .alert-close').click(e => {
    const alert = $(e.target).parent();
    alert.fadeOut(800);
  });

  // Delete Cart Item
  $('.btn-del').on('click', e => {
    const itemId = $(e.target).attr('item-Id');

    // Make Ajax Request
    $.ajax({
      type: 'DELETE',
      url: `/cart/${itemId}`,
      success: res => {
        window.location.href = '/cart';
      },
      error: err => {
        console.log(err);
        window.location.href = '/cart';
      }
    });
  });
});
