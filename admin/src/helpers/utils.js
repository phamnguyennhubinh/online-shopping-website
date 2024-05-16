function formatVndCurrency(amount) {
    // Format the amount with comma separated thousands
    let formattedAmount = Number(amount).toFixed(0).replace(/\d(?=(\d{3})+$)/g, '$&,');
    // Append 'đ' to indicate Vietnamese đồng
    formattedAmount += 'vnđ';
    return formattedAmount;
}

export default {
    formatVndCurrency
}