

let mobileNumber = "";
const validOTP = "123456"; // Fixed OTP

function sendOTP() {
    mobileNumber = document.getElementById("mobile").value;
    if (mobileNumber.length !== 10 || isNaN(mobileNumber)) {
        document.getElementById("message").innerText = "Enter valid mobile number!";
        return;
    }

    alert("Otp is sent to " + mobileNumber); // Show the fixed OTP
    document.getElementById("register-box").style.display = "none";
    document.getElementById("otp-box").style.display = "block";
    document.getElementById("message").innerText = "OTP sent to " + mobileNumber;
}

function verifyOTP() {
    const otp = document.getElementById("otp").value;
    if (otp === validOTP) {
        document.getElementById("message").innerText = "✅ OTP Verified Successfully!";
        setTimeout(() => {
            window.location = 'home.html'; // Redirect after successful verification
        }, 1000);
    } else {
        document.getElementById("message").innerText = "❌ Invalid OTP. Try again!";
    }
}

function resendOTP() {
    alert("Your OTP is: " + validOTP);
    document.getElementById("message").innerText = "OTP resent to " + mobileNumber;
}

function goBack() {
    document.getElementById("otp-box").style.display = "none";
    document.getElementById("register-box").style.display = "block";
    document.getElementById("otp").value = "";
    document.getElementById("message").innerText = "";
}
