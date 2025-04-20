
        // Sample coupon data
       
        const fetchData=async ()=>{
            try {
                const couponData=await fetch('/user/coupon-data',{
                    headers: {
                        "Content-Type": "application/json",
                      }
                })
                if(!couponData.ok){
                    const err=await couponData.json()
                    console.log(err)
                    throw  new Error(err.message||'internal server error')
                }
                const coupenData=await couponData.json()
                return coupenData
            } catch (error) {
                console.log(error)
                showToast(error.message||'internal server error')
            }
        }
        // Function to render coupons
        async function renderCoupons() {
            const coupenData=await fetchData()
            if(!coupenData.length){
                return
            }
            console.log(coupenData)

            const couponListElement = document.getElementById('couponList');
            couponListElement.innerHTML = '';
            
            const today = new Date();
            
            coupenData?.forEach(coupon => {
                const startDate = new Date(coupon.startingDate);
                const expiryDate = new Date(coupon.expiry);
                
                const isExpired = expiryDate < today;
                const isExpiringSoon = !isExpired && expiryDate - today < 7 * 24 * 60 * 60 * 1000; // 7 days
                const isActive = startDate <= today && today <= expiryDate;
                
                let statusClass = '';
                if (isExpired) statusClass = 'expired';
                else if (isExpiringSoon) statusClass = 'expiring-soon';
                else if (isActive) statusClass = 'active';
                
                const couponElement = document.createElement('div');
                couponElement.className = `coupon-card ${statusClass}`;
                
                couponElement.innerHTML = `
                    <div class="coupon-header">
                        <div class="coupon-amount"> ₹ ${coupon.amount} Flat</div>
                    </div>
                    <div class="coupon-body">
                        <div class="coupon-name">${coupon.name}</div>
                        <div class="coupon-info">
                            <div class="info-item">
                                <span class="info-label">Credit:</span>
                                <span>Order Above 1000</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Start:</span>
                                <span>${formatDate(coupon.startingDate)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Expires:</span>
                                <span>${formatDate(coupon.expiry)}</span>
                            </div>
                        </div>
                        <div  class="code-section">
                            <span class="coupon-code">${coupon.code}</span>
                            <button class="copy-btn" onclick="copyCode('${coupon.code}')">Copy Code</button>
                        </div>
                    </div>
                `;
                
                couponListElement.appendChild(couponElement);
            });
        }
        
        // Format date function
        function formatDate(dateString) {
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }
        
        // Copy code to clipboard
        function copyCode(code) {
            navigator.clipboard.writeText(code)
                .then(() => showToast('code coplied'))
                .catch(err => console.error('Could not copy text: ', err));
        }
        
        // Show toast notification
        function showToast() {
            const toast = document.getElementById('toast');
            toast.classList.add('show-toast');
            
            setTimeout(() => {
                toast.classList.remove('show-toast');
            }, 2000);
        }
        
        // Go back function
        function goBack() {
            window.history.back();
           
            setTimeout(() => {
                if (window.location.href === document.referrer) {
                    window.location.href = '/';
                }
            }, 100);
        }
        
        // Initialize the page
        window.onload = function() {
            renderCoupons();
        };
        function showToast(message) {
            Toastify({
              text: message,
              duration: 4000,
              close: true,
              gravity: "top",
              position: "center",
            }).showToast();
          }