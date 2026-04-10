// 小红书应用主逻辑

// 数据存储管理
const Storage = {
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};

// 模拟数据
const MockData = {
    // 生成随机用户
    users: [
        { id: 1, username: '美食达人', avatar: 'https://picsum.photos/seed/user1/100/100' },
        { id: 2, username: '旅行日记', avatar: 'https://picsum.photos/seed/user2/100/100' },
        { id: 3, username: '穿搭博主', avatar: 'https://picsum.photos/seed/user3/100/100' },
        { id: 4, username: '生活记录', avatar: 'https://picsum.photos/seed/user4/100/100' },
        { id: 5, username: '摄影爱好者', avatar: 'https://picsum.photos/seed/user5/100/100' },
        { id: 6, username: '美妆博主', avatar: 'https://picsum.photos/seed/user6/100/100' },
        { id: 7, username: '健身达人', avatar: 'https://picsum.photos/seed/user7/100/100' },
        { id: 8, username: '读书笔记', avatar: 'https://picsum.photos/seed/user8/100/100' }
    ],

    // 生成帖子数据
    generatePosts() {
        const titles = [
            '今日份的美食分享，太好吃了！',
            '周末去哪儿玩？这个地方超美',
            'OOTD | 今日穿搭分享',
            '发现一家宝藏店铺，推荐给大家',
            '生活小技巧，让你的生活更便捷',
            '旅行日记 | 这个风景太治愈了',
            '我的护肤日常，皮肤变好了',
            '健身打卡第30天，继续加油',
            '读书笔记分享，这本书太棒了',
            '家居好物推荐，提升幸福感',
            '今天的心情很好，分享美好',
            '美食探店 | 这家店值得打卡',
            '拍照技巧分享，拍出大片感',
            '我的日常Vlog，记录生活',
            '好物分享 | 这些单品太实用了'
        ];

        const posts = [];
        for (let i = 0; i < 20; i++) {
            const user = this.users[Math.floor(Math.random() * this.users.length)];
            posts.push({
                id: i + 1,
                title: titles[Math.floor(Math.random() * titles.length)],
                image: `https://picsum.photos/seed/post${i + 1}/300/${400 + Math.floor(Math.random() * 200)}`,
                author: user,
                likes: Math.floor(Math.random() * 1000) + 10,
                isLiked: false,
                isCollected: false,
                comments: [],
                timestamp: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)
            });
        }
        return posts;
    }
};

// 应用状态
const AppState = {
    currentUser: null,
    posts: [],
    likedPosts: [],
    collectedPosts: [],
    following: [],
    followers: [],
    currentPostId: null,
    currentTab: 'works'
};

// 初始化数据
function initData() {
    // 从localStorage加载数据
    AppState.currentUser = Storage.get('currentUser');
    AppState.posts = Storage.get('posts') || MockData.generatePosts();
    AppState.likedPosts = Storage.get('likedPosts') || [];
    AppState.collectedPosts = Storage.get('collectedPosts') || [];
    AppState.following = Storage.get('following') || [];
    AppState.followers = Storage.get('followers') || [];

    // 保存初始帖子数据
    if (!Storage.get('posts')) {
        Storage.set('posts', AppState.posts);
    }
}

// DOM 元素缓存
let Elements = null;

// 初始化 DOM 元素（在 DOM 加载完成后调用）
function initElements() {
    Elements = {
        // 页面
        feedPage: document.getElementById('feedPage'),
        publishPage: document.getElementById('publishPage'),
        profilePage: document.getElementById('profilePage'),

        // 容器
        waterfallContainer: document.getElementById('waterfallContainer'),
        worksGrid: document.getElementById('worksGrid'),
        likedGrid: document.getElementById('likedGrid'),
        collectedGrid: document.getElementById('collectedGrid'),

        // 用户信息
        userAvatar: document.getElementById('userAvatar'),
        userNickname: document.getElementById('userNickname'),
        userId: document.getElementById('userId'),
        followingCount: document.getElementById('followingCount'),
        followersCount: document.getElementById('followersCount'),
        likesCount: document.getElementById('likesCount'),

        // 弹窗
        loginModal: document.getElementById('loginModal'),
        userListModal: document.getElementById('userListModal'),
        commentModal: document.getElementById('commentModal'),
        shareModal: document.getElementById('shareModal'),
        bottomSheet: document.getElementById('bottomSheet'),

        // 输入
        loginUsername: document.getElementById('loginUsername'),
        loginPassword: document.getElementById('loginPassword'),
        commentInput: document.getElementById('commentInput'),
        noteTitle: document.getElementById('noteTitle'),
        noteContent: document.getElementById('noteContent'),
        imageInput: document.getElementById('imageInput'),
        previewArea: document.getElementById('previewArea'),

        // 列表
        userList: document.getElementById('userList'),
        commentsList: document.getElementById('commentsList'),

        // 其他
        toast: document.getElementById('toast'),
        userListTitle: document.getElementById('userListTitle')
    };
}

// 工具函数
const Utils = {
    // 显示提示
    showToast(message) {
        if (!Elements || !Elements.toast) {
            console.warn('Toast element not found');
            return;
        }
        Elements.toast.textContent = message;
        Elements.toast.classList.add('active');
        setTimeout(() => {
            if (Elements && Elements.toast) {
                Elements.toast.classList.remove('active');
            }
        }, 2000);
    },

    // 格式化数字
    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + 'w';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    },

    // 格式化时间
    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;

        if (diff < minute) {
            return '刚刚';
        } else if (diff < hour) {
            return Math.floor(diff / minute) + '分钟前';
        } else if (diff < day) {
            return Math.floor(diff / hour) + '小时前';
        } else if (diff < 7 * day) {
            return Math.floor(diff / day) + '天前';
        } else {
            const date = new Date(timestamp);
            return `${date.getMonth() + 1}月${date.getDate()}日`;
        }
    },

    // 生成唯一ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// 渲染函数
const Render = {
    // 渲染瀑布流
    renderWaterfall() {
        if (!Elements || !Elements.waterfallContainer) {
            console.warn('Waterfall container not found');
            return;
        }
        const container = Elements.waterfallContainer;
        container.innerHTML = '';

        // 创建两列
        const leftColumn = document.createElement('div');
        const rightColumn = document.createElement('div');
        leftColumn.className = 'waterfall-column';
        rightColumn.className = 'waterfall-column';

        AppState.posts.forEach((post, index) => {
            const card = this.createNoteCard(post);
            if (index % 2 === 0) {
                leftColumn.appendChild(card);
            } else {
                rightColumn.appendChild(card);
            }
        });

        container.appendChild(leftColumn);
        container.appendChild(rightColumn);
    },

    // 创建笔记卡片
    createNoteCard(post) {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.dataset.postId = post.id;

        const isLiked = AppState.likedPosts.includes(post.id);
        const isCollected = AppState.collectedPosts.includes(post.id);

        card.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="card-image" loading="lazy">
            <div class="card-content">
                <div class="card-title">${post.title}</div>
                <div class="card-author-row">
                    <img src="${post.author.avatar}" alt="${post.author.username}" class="author-avatar">
                    <span class="author-name">${post.author.username}</span>
                </div>
                <div class="card-actions-row">
                    <div class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                        <span class="icon">${isLiked ? '❤️' : '🤍'}</span>
                        <span class="count">${Utils.formatNumber(post.likes)}</span>
                    </div>
                    <div class="action-btn collect-btn ${isCollected ? 'collected' : ''}" data-post-id="${post.id}">
                        <span class="icon">${isCollected ? '⭐' : '☆'}</span>
                    </div>
                    <div class="action-btn comment-btn" data-post-id="${post.id}">
                        <span class="icon">💬</span>
                    </div>
                    <div class="action-btn share-btn" data-post-id="${post.id}">
                        <span class="icon">↗️</span>
                    </div>
                </div>
            </div>
        `;

        // 绑定事件
        const likeBtn = card.querySelector('.like-btn');
        const collectBtn = card.querySelector('.collect-btn');
        const commentBtn = card.querySelector('.comment-btn');
        const shareBtn = card.querySelector('.share-btn');

        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            Actions.toggleLike(post.id);
        });

        collectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            Actions.toggleCollect(post.id);
        });

        commentBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            Actions.openCommentModal(post.id);
        });

        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            Actions.openShareModal(post.id);
        });

        return card;
    },

    // 渲染用户资料
    renderProfile() {
        if (AppState.currentUser) {
            Elements.userAvatar.src = AppState.currentUser.avatar;
            Elements.userNickname.textContent = AppState.currentUser.username;
            Elements.userId.textContent = `ID: ${AppState.currentUser.id}`;
        } else {
            Elements.userAvatar.src = 'https://picsum.photos/seed/default/100/100';
            Elements.userNickname.textContent = '未登录';
            Elements.userId.textContent = '点击登录';
        }

        Elements.followingCount.textContent = Utils.formatNumber(AppState.following.length);
        Elements.followersCount.textContent = Utils.formatNumber(AppState.followers.length);

        // 计算获赞数
        const totalLikes = AppState.posts
            .filter(post => post.author.id === (AppState.currentUser?.id || -1))
            .reduce((sum, post) => sum + post.likes, 0);
        Elements.likesCount.textContent = Utils.formatNumber(totalLikes);
    },

    // 渲染作品网格
    renderWorksGrid() {
        const container = Elements.worksGrid;
        container.innerHTML = '';

        const myPosts = AppState.posts.filter(post =>
            post.author.id === (AppState.currentUser?.id || -1)
        );

        if (myPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">📝</div>
                    <p>还没有发布作品</p>
                </div>
            `;
            return;
        }

        myPosts.forEach(post => {
            const item = document.createElement('div');
            item.className = 'grid-item';
            item.innerHTML = `<img src="${post.image}" alt="${post.title}">`;
            container.appendChild(item);
        });
    },

    // 渲染已点赞网格
    renderLikedGrid() {
        const container = Elements.likedGrid;
        container.innerHTML = '';

        const likedPosts = AppState.posts.filter(post =>
            AppState.likedPosts.includes(post.id)
        );

        if (likedPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">❤️</div>
                    <p>还没有点赞内容</p>
                </div>
            `;
            return;
        }

        likedPosts.forEach(post => {
            const item = document.createElement('div');
            item.className = 'grid-item';
            item.innerHTML = `<img src="${post.image}" alt="${post.title}">`;
            container.appendChild(item);
        });
    },

    // 渲染收藏网格
    renderCollectedGrid() {
        const container = Elements.collectedGrid;
        container.innerHTML = '';

        const collectedPosts = AppState.posts.filter(post =>
            AppState.collectedPosts.includes(post.id)
        );

        if (collectedPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-icon">⭐</div>
                    <p>还没有收藏内容</p>
                </div>
            `;
            return;
        }

        collectedPosts.forEach(post => {
            const item = document.createElement('div');
            item.className = 'grid-item';
            item.innerHTML = `<img src="${post.image}" alt="${post.title}">`;
            container.appendChild(item);
        });
    },

    // 渲染评论列表
    renderComments(postId) {
        const post = AppState.posts.find(p => p.id === postId);
        if (!post) return;

        const container = Elements.commentsList;
        container.innerHTML = '';

        if (!post.comments || post.comments.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无评论，快来抢沙发吧~</p></div>';
            return;
        }

        post.comments.forEach(comment => {
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <img src="${comment.author.avatar}" alt="${comment.author.username}" class="comment-avatar">
                <div class="comment-content">
                    <div class="comment-author">${comment.author.username}</div>
                    <div class="comment-text">${comment.text}</div>
                    <div class="comment-meta">
                        <span>${Utils.formatTime(comment.timestamp)}</span>
                        <div class="comment-like ${comment.isLiked ? 'liked' : ''}" data-comment-id="${comment.id}">
                            <span>${comment.isLiked ? '❤️' : '🤍'}</span>
                            <span>${comment.likes || 0}</span>
                        </div>
                    </div>
                </div>
            `;

            const likeBtn = item.querySelector('.comment-like');
            likeBtn.addEventListener('click', () => {
                Actions.toggleCommentLike(postId, comment.id);
            });

            container.appendChild(item);
        });
    },

    // 渲染用户列表
    renderUserList(type) {
        Elements.userListTitle.textContent = type === 'following' ? '关注列表' : '粉丝列表';
        const container = Elements.userList;
        container.innerHTML = '';

        const users = type === 'following' ? AppState.following : AppState.followers;

        if (users.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>暂无${type === 'following' ? '关注' : '粉丝'}</p></div>`;
            return;
        }

        users.forEach(user => {
            const isFollowing = AppState.following.some(f => f.id === user.id);
            const isMutual = isFollowing && AppState.followers.some(f => f.id === user.id);

            const item = document.createElement('div');
            item.className = 'user-list-item';
            item.innerHTML = `
                <div class="user-list-info">
                    <img src="${user.avatar}" alt="${user.username}" class="user-list-avatar">
                    <span class="user-list-name">${user.username}</span>
                </div>
                <button class="follow-btn ${isMutual ? 'mutual' : (isFollowing ? 'following' : '')}" data-user-id="${user.id}">
                    ${isMutual ? '互相关注' : (isFollowing ? '已关注' : '+ 关注')}
                </button>
            `;

            const followBtn = item.querySelector('.follow-btn');
            followBtn.addEventListener('click', () => {
                Actions.toggleFollow(user);
            });

            container.appendChild(item);
        });
    }
};

// 操作函数
const Actions = {
    // 切换页面
    switchPage(pageName) {
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });

        // 更新页面显示
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 显示对应页面
        if (pageName === 'feed') {
            Elements.feedPage.classList.add('active');
            Render.renderWaterfall();
        } else if (pageName === 'publish') {
            if (!AppState.currentUser) {
                this.openLoginModal();
                return;
            }
            Elements.publishPage.classList.add('active');
        } else if (pageName === 'profile') {
            Elements.profilePage.classList.add('active');
            Render.renderProfile();
            Render.renderWorksGrid();
        }
    },

    // 点赞/取消点赞
    toggleLike(postId) {
        const post = AppState.posts.find(p => p.id === postId);
        if (!post) return;

        const index = AppState.likedPosts.indexOf(postId);
        if (index === -1) {
            AppState.likedPosts.push(postId);
            post.likes++;
            Utils.showToast('点赞成功');
        } else {
            AppState.likedPosts.splice(index, 1);
            post.likes--;
        }

        Storage.set('likedPosts', AppState.likedPosts);
        Storage.set('posts', AppState.posts);
        Render.renderWaterfall();
    },

    // 收藏/取消收藏
    toggleCollect(postId) {
        const index = AppState.collectedPosts.indexOf(postId);
        if (index === -1) {
            AppState.collectedPosts.push(postId);
            Utils.showToast('收藏成功');
        } else {
            AppState.collectedPosts.splice(index, 1);
            Utils.showToast('取消收藏');
        }

        Storage.set('collectedPosts', AppState.collectedPosts);
        Render.renderWaterfall();
    },

    // 打开评论弹窗
    openCommentModal(postId) {
        AppState.currentPostId = postId;
        Render.renderComments(postId);
        Elements.commentModal.classList.add('active');
    },

    // 关闭评论弹窗
    closeCommentModal() {
        Elements.commentModal.classList.remove('active');
        AppState.currentPostId = null;
    },

    // 发表评论
    postComment() {
        const text = Elements.commentInput.value.trim();
        if (!text) {
            Utils.showToast('请输入评论内容');
            return;
        }

        if (!AppState.currentUser) {
            Utils.showToast('请先登录');
            this.openLoginModal();
            return;
        }

        const post = AppState.posts.find(p => p.id === AppState.currentPostId);
        if (!post) return;

        const comment = {
            id: Utils.generateId(),
            author: AppState.currentUser,
            text: text,
            timestamp: Date.now(),
            likes: 0,
            isLiked: false
        };

        if (!post.comments) {
            post.comments = [];
        }
        post.comments.push(comment);

        Storage.set('posts', AppState.posts);
        Elements.commentInput.value = '';
        Render.renderComments(AppState.currentPostId);
        Utils.showToast('评论成功');
    },

    // 点赞评论
    toggleCommentLike(postId, commentId) {
        const post = AppState.posts.find(p => p.id === postId);
        if (!post || !post.comments) return;

        const comment = post.comments.find(c => c.id === commentId);
        if (!comment) return;

        comment.isLiked = !comment.isLiked;
        comment.likes = (comment.likes || 0) + (comment.isLiked ? 1 : -1);

        Storage.set('posts', AppState.posts);
        Render.renderComments(postId);
    },

    // 打开分享弹窗
    openShareModal(postId) {
        AppState.currentPostId = postId;
        Elements.bottomSheet.classList.add('active');
    },

    // 关闭分享弹窗
    closeShareModal() {
        Elements.bottomSheet.classList.remove('active');
        AppState.currentPostId = null;
    },

    // 分享操作
    share(type) {
        switch (type) {
            case 'friend':
                Utils.showToast('已分享给好友');
                break;
            case 'copy':
                Utils.showToast('链接已复制到剪贴板');
                break;
            case 'wechat':
                Utils.showToast('已分享到微信');
                break;
            case 'weibo':
                Utils.showToast('已分享到微博');
                break;
        }
        this.closeShareModal();
    },

    // 打开登录弹窗
    openLoginModal() {
        if (!Elements || !Elements.loginModal) {
            console.warn('Login modal not found');
            return;
        }
        Elements.loginModal.classList.add('active');
    },

    // 关闭登录弹窗
    closeLoginModal() {
        if (!Elements || !Elements.loginModal) {
            console.warn('Login modal not found');
            return;
        }
        Elements.loginModal.classList.remove('active');
        if (Elements.loginUsername) Elements.loginUsername.value = '';
        if (Elements.loginPassword) Elements.loginPassword.value = '';
    },

    // 登录
    login() {
        if (!Elements || !Elements.loginUsername || !Elements.loginPassword) {
            console.warn('Login form elements not found');
            return;
        }
        const username = Elements.loginUsername.value.trim();
        const password = Elements.loginPassword.value.trim();

        if (!username || !password) {
            Utils.showToast('请输入用户名和密码');
            return;
        }

        // 简单验证
        if (username === 'admin' && password === '123456') {
            AppState.currentUser = {
                id: 999,
                username: '管理员',
                avatar: 'https://picsum.photos/seed/admin/100/100'
            };

            Storage.set('currentUser', AppState.currentUser);
            this.closeLoginModal();
            Utils.showToast('登录成功');

            // 如果在个人页面，刷新显示
            if (Elements.profilePage.classList.contains('active')) {
                Render.renderProfile();
                Render.renderWorksGrid();
            }
        } else {
            Utils.showToast('用户名或密码错误');
        }
    },

    // 打开用户列表弹窗
    openUserListModal(type) {
        Render.renderUserList(type);
        Elements.userListModal.classList.add('active');
    },

    // 关闭用户列表弹窗
    closeUserListModal() {
        Elements.userListModal.classList.remove('active');
    },

    // 关注/取消关注
    toggleFollow(user) {
        const index = AppState.following.findIndex(f => f.id === user.id);
        if (index === -1) {
            AppState.following.push(user);
            Utils.showToast('关注成功');
        } else {
            AppState.following.splice(index, 1);
            Utils.showToast('已取消关注');
        }

        Storage.set('following', AppState.following);
        Render.renderUserList('following');
        Render.renderProfile();
    },

    // 发布笔记
    publishNote() {
        const title = Elements.noteTitle.value.trim();
        const content = Elements.noteContent.value.trim();

        if (!title) {
            Utils.showToast('请输入标题');
            return;
        }

        if (!AppState.currentUser) {
            Utils.showToast('请先登录');
            this.openLoginModal();
            return;
        }

        // 获取预览图片
        const previewImages = Elements.previewArea.querySelectorAll('img');
        const imageUrl = previewImages.length > 0
            ? previewImages[0].src
            : `https://picsum.photos/seed/${Utils.generateId()}/300/400`;

        const newPost = {
            id: parseInt(Utils.generateId()),
            title: title,
            image: imageUrl,
            author: AppState.currentUser,
            likes: 0,
            isLiked: false,
            isCollected: false,
            comments: [],
            timestamp: Date.now()
        };

        AppState.posts.unshift(newPost);
        Storage.set('posts', AppState.posts);

        // 清空表单
        Elements.noteTitle.value = '';
        Elements.noteContent.value = '';
        Elements.previewArea.innerHTML = '';

        Utils.showToast('发布成功');
        this.switchPage('feed');
    },

    // 处理图片上传
    handleImageUpload(files) {
        Elements.previewArea.innerHTML = '';

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-item';
                Elements.previewArea.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    },

    // 切换个人页面标签
    switchProfileTab(tabName) {
        // 更新标签状态
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
            }
        });

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        if (tabName === 'works') {
            document.getElementById('worksTab').classList.add('active');
            Render.renderWorksGrid();
        } else if (tabName === 'liked') {
            document.getElementById('likedTab').classList.add('active');
            Render.renderLikedGrid();
        } else if (tabName === 'collected') {
            document.getElementById('collectedTab').classList.add('active');
            Render.renderCollectedGrid();
        }
    }
};

// 事件绑定
function bindEvents() {
    // 底部导航
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            Actions.switchPage(item.dataset.page);
        });
    });

    // 登录相关
    document.getElementById('closeLogin').addEventListener('click', () => Actions.closeLoginModal());
    document.querySelector('.login-modal .modal-overlay').addEventListener('click', () => Actions.closeLoginModal());
    document.getElementById('loginBtn').addEventListener('click', () => Actions.login());

    // 用户资料点击登录
    Elements.userId.addEventListener('click', () => {
        if (!AppState.currentUser) {
            Actions.openLoginModal();
        }
    });
    Elements.userAvatar.addEventListener('click', () => {
        if (!AppState.currentUser) {
            Actions.openLoginModal();
        }
    });

    // 关注/粉丝列表
    document.getElementById('followingBtn').addEventListener('click', () => {
        Actions.openUserListModal('following');
    });
    document.getElementById('followersBtn').addEventListener('click', () => {
        Actions.openUserListModal('followers');
    });
    document.getElementById('closeUserList').addEventListener('click', () => Actions.closeUserListModal());
    document.querySelector('.user-list-modal .modal-overlay').addEventListener('click', () => Actions.closeUserListModal());

    // 评论相关
    document.getElementById('closeComment').addEventListener('click', () => Actions.closeCommentModal());
    document.querySelector('.comment-modal .modal-overlay').addEventListener('click', () => Actions.closeCommentModal());
    document.getElementById('sendComment').addEventListener('click', () => Actions.postComment());
    Elements.commentInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            Actions.postComment();
        }
    });

    // 分享相关
    document.getElementById('closeShare').addEventListener('click', () => Actions.closeShareModal());
    document.querySelector('.share-modal .modal-overlay').addEventListener('click', () => Actions.closeShareModal());
    document.getElementById('cancelShare').addEventListener('click', () => Actions.closeShareModal());
    document.querySelector('.bottom-sheet .sheet-overlay').addEventListener('click', () => Actions.closeShareModal());

    // 分享选项
    document.querySelectorAll('.sheet-option').forEach(option => {
        option.addEventListener('click', () => {
            Actions.share(option.dataset.type);
        });
    });

    // 个人页面标签切换
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.addEventListener('click', () => {
            Actions.switchProfileTab(tab.dataset.tab);
        });
    });

    // 发布相关
    document.getElementById('uploadArea').addEventListener('click', () => {
        Elements.imageInput.click();
    });
    Elements.imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            Actions.handleImageUpload(e.target.files);
        }
    });
    document.getElementById('publishBtn').addEventListener('click', () => Actions.publishNote());
}

// 初始化应用
function initApp() {
    // 先初始化 DOM 元素
    initElements();
    initData();
    bindEvents();
    Render.renderWaterfall();

    // 初始化一些关注/粉丝数据
    if (AppState.following.length === 0) {
        AppState.following = MockData.users.slice(0, 3);
        Storage.set('following', AppState.following);
    }
    if (AppState.followers.length === 0) {
        AppState.followers = MockData.users.slice(3, 6);
        Storage.set('followers', AppState.followers);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initApp);
