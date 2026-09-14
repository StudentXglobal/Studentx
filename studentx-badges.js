/*
=========================================================
 STUDENTX CENTRAL BADGE SYSTEM
=========================================================

Premium Plus  -> Gold ✓
Premium       -> Purple ✓
Verified      -> Purple ✓
No status     -> No badge

This single file can be used by:
Profile, Home, Posts, Videos, Live, StudyHub,
Chat, Search, Notifications, Communities, Groups,
Pages, Comments and other StudentX components.

IMPORTANT:
Load this file AFTER your existing Supabase client.
It does NOT create a second Supabase client.
=========================================================
*/

(function (window) {
    "use strict";

    const CACHE_TIME = 5 * 60 * 1000;

    const profileCache = new Map();
    const realtimeChannels = new Map();

    /* =====================================================
       SUPABASE
    ===================================================== */

    function getSupabase() {
        return window.supabaseClient || null;
    }

    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /* =====================================================
       CENTRAL BADGE FUNCTION
    ===================================================== */

    function getPremiumBadge(user) {

        if (!user) {
            return "";
        }

        /*
         * Premium Plus
         * Highest priority
         */
        if (user.premium_plan === "plus") {

            return `
                <span
                    class="studentx-badge premium-plus-badge"
                    title="StudentX Premium Plus"
                    aria-label="StudentX Premium Plus Verified"
                >✓</span>
            `;
        }

        /*
         * StudentX Premium
         */
        if (user.premium_plan === "standard") {

            return `
                <span
                    class="studentx-badge premium-badge"
                    title="StudentX Premium"
                    aria-label="StudentX Premium Verified"
                >✓</span>
            `;
        }

        /*
         * Normal verified account
         */
        if (user.verified === true) {

            return `
                <span
                    class="studentx-badge verified-badge"
                    title="Verified StudentX account"
                    aria-label="Verified StudentX account"
                >✓</span>
            `;
        }

        return "";
    }

    /* =====================================================
       USER NAME + BADGE
    ===================================================== */

    function userNameHTML(user) {

        if (!user) {
            return "StudentX User";
        }

        const name =
            user.full_name ||
            user.username ||
            "StudentX User";

        return `
            <span class="studentx-name">
                ${escapeHTML(name)}
                ${getPremiumBadge(user)}
            </span>
        `;
    }

    /* =====================================================
       CSS
    ===================================================== */

    function addBadgeCSS() {

        if (
            document.getElementById(
                "studentx-central-badge-css"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "studentx-central-badge-css";

        style.textContent = `

            .studentx-name {
                display: inline;
            }

            .studentx-badge {

                display: inline-flex;

                align-items: center;

                justify-content: center;

                width: 17px;

                height: 17px;

                min-width: 17px;

                border-radius: 50%;

                color: #ffffff;

                font-size: 10px;

                font-weight: 900;

                line-height: 1;

                vertical-align: middle;

                margin-left: 5px;

                box-sizing: border-box;

                font-family: Arial, sans-serif;
            }

            /*
             * Normal Verified
             * StudentX Premium
             */
            .verified-badge,
            .premium-badge {

                background: #9b4dff;

            }

            /*
             * StudentX Premium Plus
             */
            .premium-plus-badge {

                background: #f5b700;

            }

        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       CACHE
    ===================================================== */

    function saveCache(userId, profile) {

        profileCache.set(
            String(userId),
            {
                profile: profile,
                time: Date.now()
            }
        );
    }

    function readCache(userId) {

        const item =
            profileCache.get(
                String(userId)
            );

        if (!item) {
            return null;
        }

        if (
            Date.now() - item.time >
            CACHE_TIME
        ) {

            profileCache.delete(
                String(userId)
            );

            return null;
        }

        return item.profile;
    }

    /* =====================================================
       GET PROFILE FROM SUPABASE
    ===================================================== */

    async function getUserProfile(userId) {

        if (!userId) {
            return null;
        }

        const cached =
            readCache(userId);

        if (cached) {
            return cached;
        }

        const supabase =
            getSupabase();

        if (!supabase) {

            console.warn(
                "StudentXBadges: Supabase client not found."
            );

            return null;
        }

        const {
            data,
            error
        } = await supabase

            .from("profiles")

            .select(`
                id,
                full_name,
                username,
                verified,
                premium_plan,
                avatar_url
            `)

            .eq("id", userId)

            .maybeSingle();

        if (error) {

            console.error(
                "StudentXBadges profile error:",
                error
            );

            return null;
        }

        if (data) {

            saveCache(
                userId,
                data
            );

            subscribeToProfile(
                userId
            );
        }

        return data || null;
    }

    /* =====================================================
       RENDER BADGE
    ===================================================== */

    function renderUserName(
        element,
        user
    ) {

        if (!element || !user) {
            return;
        }

        /*
         * Replace the name inside this element.
         * This prevents duplicate badges.
         */
        element.innerHTML =
            userNameHTML(user);

        element.dataset
            .studentxBadgeReady =
            "true";
    }

    /* =====================================================
       RENDER USING USER ID
    ===================================================== */

    async function renderByUserId(
        element,
        userId
    ) {

        if (!element || !userId) {
            return;
        }

        element.dataset
            .studentxUserId =
            userId;

        const profile =
            await getUserProfile(
                userId
            );

        if (!profile) {
            return;
        }

        renderUserName(
            element,
            profile
        );
    }

    /* =====================================================
       AUTOMATIC RENDER
    ===================================================== */

    async function scanPage(
        root = document
    ) {

        if (
            !root ||
            !root.querySelectorAll
        ) {
            return;
        }

        const elements =
            root.querySelectorAll(
                "[data-studentx-user-id]"
            );

        for (
            const element
            of elements
        ) {

            const userId =
                element.getAttribute(
                    "data-studentx-user-id"
                );

            if (!userId) {
                continue;
            }

            await renderByUserId(
                element,
                userId
            );
        }
    }

    /* =====================================================
       REALTIME SUPABASE UPDATE
    ===================================================== */

    function subscribeToProfile(
        userId
    ) {

        const supabase =
            getSupabase();

        if (
            !supabase ||
            !userId
        ) {
            return;
        }

        const key =
            String(userId);

        if (
            realtimeChannels.has(
                key
            )
        ) {
            return;
        }

        try {

            const channel =
                supabase

                    .channel(
                        `studentx-badge-${key}`
                    )

                    .on(
                        "postgres_changes",
                        {
                            event: "UPDATE",

                            schema: "public",

                            table: "profiles",

                            filter:
                                `id=eq.${key}`
                        },

                        function (payload) {

                            const updatedUser =
                                payload.new;

                            /*
                             * Update cache
                             */
                            saveCache(
                                key,
                                updatedUser
                            );

                            /*
                             * Update every occurrence
                             * of this user on the page.
                             */
                            document
                                .querySelectorAll(
                                    `[data-studentx-user-id="${CSS.escape(key)}"]`
                                )
                                .forEach(
                                    function (
                                        element
                                    ) {

                                        renderUserName(
                                            element,
                                            updatedUser
                                        );

                                    }
                                );
                        }
                    )

                    .subscribe();

            realtimeChannels.set(
                key,
                channel
            );

        } catch (error) {

            console.warn(
                "StudentX badge realtime error:",
                error
            );

        }
    }

    /* =====================================================
       OBSERVE DYNAMIC CONTENT
    ===================================================== */

    function observePage() {

        if (!document.body) {
            return;
        }

        let timer = null;

        const observer =
            new MutationObserver(
                function (mutations) {

                    const hasNewContent =
                        mutations.some(
                            function (
                                mutation
                            ) {

                                return (
                                    mutation
                                        .addedNodes
                                        .length > 0
                                );

                            }
                        );

                    if (!hasNewContent) {
                        return;
                    }

                    clearTimeout(timer);

                    timer =
                        setTimeout(
                            function () {

                                scanPage(
                                    document
                                );

                            },
                            100
                        );

                }
            );

        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.StudentXBadges = {

        /*
         * Get badge only
         */
        getPremiumBadge:

            getPremiumBadge,

        /*
         * Alias
         */
        getBadge:

            getPremiumBadge,

        /*
         * Name + badge
         */
        userNameHTML:

            userNameHTML,

        nameHTML:

            userNameHTML,

        /*
         * Get profile
         */
        getUserProfile:

            getUserProfile,

        getProfile:

            getUserProfile,

        /*
         * Render existing user object
         */
        render:

            renderUserName,

        /*
         * Render using Supabase user ID
         */
        renderByUserId:

            renderByUserId,

        /*
         * Scan page
         */
        scan:

            scanPage,

        decorate:

            scanPage,

        refresh:

            scanPage,

        /*
         * Clear cache
         */
        clearCache:

            function (userId) {

                if (userId) {

                    profileCache.delete(
                        String(userId)
                    );

                } else {

                    profileCache.clear();

                }

            }

    };

    /* =====================================================
       INITIALIZE
    ===================================================== */

    function init() {

        addBadgeCSS();

        scanPage(
            document
        );

        observePage();

    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once: true
            }
        );

    } else {

        init();

    }

})(window);
