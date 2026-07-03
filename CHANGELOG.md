## [2.13.4](https://github.com/hildebro/laneh/compare/v2.13.3...v2.13.4) (2026-07-03)


### Bug Fixes

* household RLS applying in exports ([5902feb](https://github.com/hildebro/laneh/commit/5902febe7120af558cf2d52561d30c7699fef3c0))

## [2.13.3](https://github.com/hildebro/laneh/compare/v2.13.2...v2.13.3) (2026-07-03)


### Bug Fixes

* update github action versions ([6fa6e23](https://github.com/hildebro/laneh/commit/6fa6e235daa9d6a4c3f5b63141b22c59d05c4679))

## [2.13.2](https://github.com/hildebro/laneh/compare/v2.13.1...v2.13.2) (2026-07-03)


### Bug Fixes

* database export not working ([b9cd9fd](https://github.com/hildebro/laneh/commit/b9cd9fd6c3cb6e247a9891acb7ff3d3140fa787d))

## [2.13.1](https://github.com/hildebro/laneh/compare/v2.13.0...v2.13.1) (2026-06-24)


### Bug Fixes

* docker compose user creation ([7ec35f1](https://github.com/hildebro/laneh/commit/7ec35f106686bf552407ad169dc3a6675424f4db))

# [2.13.0](https://github.com/hildebro/laneh/compare/v2.12.0...v2.13.0) (2026-06-24)


### Bug Fixes

* actually enable rls ([93248f0](https://github.com/hildebro/laneh/commit/93248f0b42ea5253660913984e85e5077bef3daa))
* add missing migration for policies/defaults ([9408e24](https://github.com/hildebro/laneh/commit/9408e24a69752590d376be7ae4fd9d54ec742f6b))
* allow 0% as default distribution ([037e249](https://github.com/hildebro/laneh/commit/037e24968cc9fce9d80f9c8d81c47dfb9356a84f))
* allow PATCH on hono ([4c02050](https://github.com/hildebro/laneh/commit/4c020502ded712d2ea88c45fdc5a1eb1beb19ef7))
* data.users only includes matching household ([fd40816](https://github.com/hildebro/laneh/commit/fd4081625a06dd8ac44103aa281f16e7e0ef01d4))
* incorrect username-taken error ([1b6f230](https://github.com/hildebro/laneh/commit/1b6f230d867652d5140925c36260a53651924925))
* make initial user admin ([a562807](https://github.com/hildebro/laneh/commit/a56280771f2d9042a49ac08602ee19857343ef87))
* password display for user cruds ([40d74ff](https://github.com/hildebro/laneh/commit/40d74ff0524da08618fc2d774d62e5fd68011cae))
* prevent cross-household distribution updates ([eb9b074](https://github.com/hildebro/laneh/commit/eb9b0741044f96a8377e87bf6cde3a6cbb5ca020))
* prevent faulty state due to failing database import ([8851e8c](https://github.com/hildebro/laneh/commit/8851e8c7e0cda0dd7d77b016555340e4d79639a3))
* prevent removal of last server/household admin ([9cb2adf](https://github.com/hildebro/laneh/commit/9cb2adf81eb79c8ecf4a310991fe641df06b755f))
* prevent serverAdmin = true while householdAdmin = false ([4974a16](https://github.com/hildebro/laneh/commit/4974a160ab45b46384e20ba1b1fb8f86621ab9f1))
* remove admin check from self-update api ([f0c987b](https://github.com/hildebro/laneh/commit/f0c987b95c9fa1cb43a3d96dae09c0ba6d22fa03))
* remove missing translation key ([3772df5](https://github.com/hildebro/laneh/commit/3772df5b1823d22e9c54426fe953666590a65ab9))
* remove RLS from user ([71dc568](https://github.com/hildebro/laneh/commit/71dc56832d0e60506b2acb832f4beba5dcfdd2dc))
* settings password field hidden ([c34afc4](https://github.com/hildebro/laneh/commit/c34afc40a38a8ec1bd4fa148bd4df84b5f43886b))
* show /settings/households for household admin ([d9808de](https://github.com/hildebro/laneh/commit/d9808de3fdb72e575aeced29469ae7f83fbe6d7f))
* toasts blurred by dialog ([ab0bec1](https://github.com/hildebro/laneh/commit/ab0bec1ea0d9e64c120bebc6d91bb570be0577a9))
* use new user crud instead of /register ([9e0e1d0](https://github.com/hildebro/laneh/commit/9e0e1d048ca085cac4882a90e5a371d6e2bc1af8))
* user form translations ([c26f3cd](https://github.com/hildebro/laneh/commit/c26f3cddc7301b65a91a0d507c45e3c66f867198))


### Features

* add default for householdId columns ([8fc4d97](https://github.com/hildebro/laneh/commit/8fc4d97772739d52b150779476587209e2496074))
* add household name field to /initialize ([5eeff2e](https://github.com/hildebro/laneh/commit/5eeff2ea17f60d316c8cc463b5147d790d0ef428))
* add household table + columns everywhere ([9620c26](https://github.com/hildebro/laneh/commit/9620c265b93c3bc185f8e1718a8f6d8b153174f2))
* add household to login ([cc19cf6](https://github.com/hildebro/laneh/commit/cc19cf6f655368a05bc7da0c9ef03c7c3fa5c1d0))
* add policies for household restriction ([fbb06b3](https://github.com/hildebro/laneh/commit/fbb06b358e09b837e593057bc672ce2de89da7ff))
* add-user button in household view ([1ec70e9](https://github.com/hildebro/laneh/commit/1ec70e92cb0592e91c5fb647c5fc88145a90fdd2))
* add/edit household in settings ([fda679d](https://github.com/hildebro/laneh/commit/fda679ddbee463745e72579a72555377594e7906))
* admin flag for users ([6718ed9](https://github.com/hildebro/laneh/commit/6718ed94fd4ebbf28e64a5861f59616cf8bd8107))
* differentiate server vs household admin ([ba74a34](https://github.com/hildebro/laneh/commit/ba74a34eccc8764d17af472895e054add7354639))
* disable admin inputs based on user state ([2eb1b93](https://github.com/hildebro/laneh/commit/2eb1b936745fb10d1631d73d2b7b5d0259914691))
* hide household/user action for non-admin. also harden api ([1604133](https://github.com/hildebro/laneh/commit/160413391b7f40105cfce5709b2a9606486067e3))
* household dropdown for new user ([bcd8697](https://github.com/hildebro/laneh/commit/bcd8697bf4c1fe768929bd062a72f72f69d46059))
* household name unique ([3b18829](https://github.com/hildebro/laneh/commit/3b1882973ff845bb62affddfbc7c692f78e55255))
* improve household users overview ([55820ab](https://github.com/hildebro/laneh/commit/55820abc3e5beebbc729e4fd0c3ea8e0e49a17e6))
* list users in household settings ([c139a59](https://github.com/hildebro/laneh/commit/c139a59fdea9e778ef4906d687becf01eeb3e62d))
* recategorize settings page ([49fa680](https://github.com/hildebro/laneh/commit/49fa6804ee26aa6a88bfa6492e340ae242d39d8e))
* save household name after login ([8686e81](https://github.com/hildebro/laneh/commit/8686e81021e9620127922b8b2f80e2e86dc0b9f8))
* unprivileged app pq user for RLS ([78f9e8d](https://github.com/hildebro/laneh/commit/78f9e8d700bdc7e196c341c3ac4759bc5a158237))
* user crud for admins ([62c374a](https://github.com/hildebro/laneh/commit/62c374a6da2643e6dfb5b0a086190c39f9cea27a))
* username unique per household ([2807c37](https://github.com/hildebro/laneh/commit/2807c37d1a3148066abb52cca6d25f3f069ef604))

# [2.12.0](https://github.com/hildebro/laneh/compare/v2.11.0...v2.12.0) (2026-06-11)


### Bug Fixes

* don't display warning on version, if remote is not present ([25c37ba](https://github.com/hildebro/laneh/commit/25c37bae262beeb5f846cbd06fda3a4334b7368a))


### Features

* add confirm double-back ([f249cc9](https://github.com/hildebro/laneh/commit/f249cc90de93c47fd74527aa0b4d11c3c83b7a95))
* differentiate app and server version ([ca5dfd7](https://github.com/hildebro/laneh/commit/ca5dfd7855b110c4e22b001d65ae23772922e4f4))
* enable "back" button on android ([6aefc22](https://github.com/hildebro/laneh/commit/6aefc22618061c50cf76f72c72d2b43453c9e417))

# [2.11.0](https://github.com/hildebro/laneh/compare/v2.10.0...v2.11.0) (2026-06-09)


### Features

* use proper icon ([c14665f](https://github.com/hildebro/laneh/commit/c14665fcaeeac4de343eb90d9f23088c7f3ab75c))

# [2.10.0](https://github.com/hildebro/laneh/compare/v2.9.0...v2.10.0) (2026-05-29)


### Bug Fixes

* broken file ([8217429](https://github.com/hildebro/laneh/commit/8217429bb9556fed0533260ca1cf9376def8f228))
* interval column name ([470b528](https://github.com/hildebro/laneh/commit/470b528e9ace65f473741db07986aed75e9aff3c))
* migration table order ([823b74b](https://github.com/hildebro/laneh/commit/823b74ba1b9cc91c94f88c36f6ed8b4a81a4b0d1))
* proper empty-value label for weekday ([786a7d4](https://github.com/hildebro/laneh/commit/786a7d49f35214b8f3b2e3782238c4aa8a5f6390))


### Features

* add assignment column to task ([8778b50](https://github.com/hildebro/laneh/commit/8778b50ac0832c70ce1b96a63c524fc0766553b9))
* better dueDate handling ([dd787e6](https://github.com/hildebro/laneh/commit/dd787e6475594cd949b42034fc26514d11d4b8da))
* don't allow type switch on existing task ([39e47bb](https://github.com/hildebro/laneh/commit/39e47bb476355c5588576a60d7eeca556126b667))
* explicit type input for tasks ([7292d66](https://github.com/hildebro/laneh/commit/7292d667c1e5e78fdc74ebf6e5a53fd89558299c))
* migrate add/update/count task ([5121ba4](https://github.com/hildebro/laneh/commit/5121ba48a5531747697e459ac32de95ef0a52edb))
* migrate markAsDone ([abad6d4](https://github.com/hildebro/laneh/commit/abad6d4f2bfdbf21c4291348b6c32f13e2cd5684))
* new merged task table ([80d708b](https://github.com/hildebro/laneh/commit/80d708b671c221e3294d50d4ea89035cc39b408e))
* use assignment column to find next due user ([3d1ac2d](https://github.com/hildebro/laneh/commit/3d1ac2d980ae8857a033a7e4a373edd4d3f7439e))

# [2.9.0](https://github.com/hildebro/laneh/compare/v2.8.1...v2.9.0) (2026-05-17)


### Bug Fixes

* centralized login ([1dafdfe](https://github.com/hildebro/laneh/commit/1dafdfe0cbc0cbdc522c730f28fff3303b5498ff))
* don't swallow generic form errors ([6db910c](https://github.com/hildebro/laneh/commit/6db910c695f29ccfa446de9e2aa0bf8a7bd15f76))
* form not working ([7c5533a](https://github.com/hildebro/laneh/commit/7c5533ae7268d9a6c91484c9b7e410decebdc153))
* locale in login errors ([a0ff339](https://github.com/hildebro/laneh/commit/a0ff339113218c3df2868e622feecf15d44109bb))
* more accurate global zod messages ([dcab980](https://github.com/hildebro/laneh/commit/dcab980bf7f9c9823add71459be11077b4474f74))
* supress ide warning ([6134827](https://github.com/hildebro/laneh/commit/61348270f1629825dd87581b77aacd790aa991f0))
* translation coming from backend ([ca59657](https://github.com/hildebro/laneh/commit/ca59657b5df8732d5dff7db48dcae4fca792943c))
* translations for zod errors ([c1f76a2](https://github.com/hildebro/laneh/commit/c1f76a2f95ff5fd05a4502160f1251ff5d476d3a))


### Features

* add ApiFormItem.svelte ([3ccff72](https://github.com/hildebro/laneh/commit/3ccff720afd4f9298d2510318c322b2096d1fc28))
* add select type to ApiFormItem.svelte ([972ef82](https://github.com/hildebro/laneh/commit/972ef82dc76ab2b50b1c04c8cdd58ba37b74c5fb))
* enable ApiForm to receive message key as validation error ([7db15c8](https://github.com/hildebro/laneh/commit/7db15c8fe119ef4d2984e795491aae7517579aee))
* frontend-only translations ([a6b73b5](https://github.com/hildebro/laneh/commit/a6b73b56445fe0140fb0095af8b83768a8872e66))
* full migration of balance/[entry] ([44ffa68](https://github.com/hildebro/laneh/commit/44ffa686493a914b569472a349a9d1f20dc0896c))
* fully migrate /initiate ([415bf2f](https://github.com/hildebro/laneh/commit/415bf2f353b5d41815c4b6fd4103f4828e63bd7a))
* fully migrate /tasks/single/add ([5a2f26b](https://github.com/hildebro/laneh/commit/5a2f26be127d91a96a386ba1fd749c09d70a6697))
* handling form-wide errors ([645748b](https://github.com/hildebro/laneh/commit/645748bf485d791cd3e3579aa5b7841ca252480e))
* improve "at least x characters" zod message ([d9839c5](https://github.com/hildebro/laneh/commit/d9839c57e1cf7cec9a8c1f27caf76c0703f3ac78))
* migrate /settings/* ([65d0193](https://github.com/hildebro/laneh/commit/65d01933e9f7626b9c4b403c137ab563b02ad696))
* migrate /settings/categories/[category] ([ed12e3d](https://github.com/hildebro/laneh/commit/ed12e3de72f6bfd5330d27139d7c36a2a8f1ec3e))
* migrate /settings/items ([ead2650](https://github.com/hildebro/laneh/commit/ead265021fcef3396a92bf471cacc1ec50873f25))
* migrate /shopping/add ([56eb1f4](https://github.com/hildebro/laneh/commit/56eb1f4f853e955f1cde1e742ea4879a93280edf))
* migrate /shopping/categorize ([1fe6f35](https://github.com/hildebro/laneh/commit/1fe6f35219463f3f90de490a2eeb2c6c7ff3f869))
* migrate /tasks ([15362a2](https://github.com/hildebro/laneh/commit/15362a2e31c591ddfb08ebe3e4c1369a3152be39))
* migrate /tasks/weekly/add ([9e0bb33](https://github.com/hildebro/laneh/commit/9e0bb33f58af5f110786005f499a094a7a26aead))
* money type changed for ApiFormItem integration ([bc08889](https://github.com/hildebro/laneh/commit/bc088898cb1ac6c9114258ba595875c2df22fa6a))
* nicer styling for validation messages ([8177d55](https://github.com/hildebro/laneh/commit/8177d559631acba6e0e12b3416ba802f98d89d0d))
* partial migrate /initiate ([247ccbd](https://github.com/hildebro/laneh/commit/247ccbd73ea242755633b55cbe216c77c8aabbf5))
* partial migrate /tasks/single/add ([c257be2](https://github.com/hildebro/laneh/commit/c257be2d402eba0f39ca734ddb552f2faf7e8d9e))
* partial migration of balance/[entry] ([9b3a19e](https://github.com/hildebro/laneh/commit/9b3a19e07919894fc2be728624f77afe63b3c20d))
* replace toast validation with inlined text ([aeb448e](https://github.com/hildebro/laneh/commit/aeb448ed9dca511635c2f51e98e808e1107cc458))

## [2.8.1](https://github.com/hildebro/laneh/compare/v2.8.0...v2.8.1) (2026-05-06)


### Bug Fixes

* capacitor header/footer spacing ([710b070](https://github.com/hildebro/laneh/commit/710b070f86897d4c767bd9b96071deb84d257b7c))
* menu not working for auth area ([3857212](https://github.com/hildebro/laneh/commit/385721218b4040aa9d5c19b9a30ad15cd4375705))
* phone status bar color ([d318a83](https://github.com/hildebro/laneh/commit/d318a83d221d2912a38c025aa38b667b8fd606ed))
* server piker article placement ([7f0920c](https://github.com/hildebro/laneh/commit/7f0920c0620f998e148a10735eb54c357c7e9f4e))
* toasts topleft instead of topright ([ddeaec2](https://github.com/hildebro/laneh/commit/ddeaec21f1b9687f4b6401376825aef221e240c4))

# [2.8.0](https://github.com/hildebro/laneh/compare/v2.7.6...v2.8.0) (2026-05-05)


### Bug Fixes

* back to draft releases for internal testing ([eae5809](https://github.com/hildebro/laneh/commit/eae5809c0e29d83dffa293f96134ac86195f055a))
* hide settings and logout outside of auth area ([1d35d2c](https://github.com/hildebro/laneh/commit/1d35d2c75734d60c482422322bdf152622019834))
* local-based formatters ([3c29462](https://github.com/hildebro/laneh/commit/3c29462d022c49151c4db50dabf29e6ebebfd6e3))
* logout button in header ([15b8988](https://github.com/hildebro/laneh/commit/15b898847741273f3da8a43fe4c0edb380e3c78d))
* remove username when logging out ([66ec035](https://github.com/hildebro/laneh/commit/66ec035b4986e53f2c024fe9cf4f094a942fdf0b))
* slight header spacing ([9687203](https://github.com/hildebro/laneh/commit/9687203a821cdfb483fff650d773a8ab997c0e09))
* user handling for android ([eb1c51c](https://github.com/hildebro/laneh/commit/eb1c51c1c89ab1cd4a752bd80ea5e614a1c2019a))


### Features

* exchange header and footer, always keep in view ([6c89686](https://github.com/hildebro/laneh/commit/6c8968635d8c1705c499d76b3bf111332d3a22f1))
* improve nav spacing ([ae4ce1f](https://github.com/hildebro/laneh/commit/ae4ce1f9164f981c0f12071cb4f98d676bcc7707))
* improved styling for login ([e329e06](https://github.com/hildebro/laneh/commit/e329e06324695ff44d1e90fb52aadd427fe9bfc8))
* language to header ([8e1e564](https://github.com/hildebro/laneh/commit/8e1e564c6998285e3a0abe3829c5860db6667c8c))
* move exit instance to menu ([ac2bfeb](https://github.com/hildebro/laneh/commit/ac2bfeb99253ddebd63f333da8ce9aac08c48493))
* move header to root layout ([0dce58f](https://github.com/hildebro/laneh/commit/0dce58fb3e9d53f272b23f2d1ec3906f97e8afb3))
* new header dropdown ([564d98d](https://github.com/hildebro/laneh/commit/564d98ddbb36788bc04b8019af5b95517a44c434))
* theme to header ([0b0bc44](https://github.com/hildebro/laneh/commit/0b0bc444b406f5e15b1a52e45c4b0f7c44888e28))
* username into menu ([01431ed](https://github.com/hildebro/laneh/commit/01431ed3bc0393cc9427d2662ef09430d645931e))

## [2.7.6](https://github.com/hildebro/laneh/compare/v2.7.5...v2.7.6) (2026-05-01)


### Bug Fixes

* change back to "completed" status ([8922c2a](https://github.com/hildebro/laneh/commit/8922c2a33692577b928f2f88f245064ab6e5a4a1))

## [2.7.5](https://github.com/hildebro/laneh/compare/v2.7.4...v2.7.5) (2026-05-01)


### Bug Fixes

* temporary change to google play status: draft ([0d00dec](https://github.com/hildebro/laneh/commit/0d00dece520980235825f907c32c685cce66b70e))

## [2.7.4](https://github.com/hildebro/laneh/compare/v2.7.3...v2.7.4) (2026-05-01)


### Bug Fixes

* remove hardcoded version number ([01aac4a](https://github.com/hildebro/laneh/commit/01aac4aeb3240b53c733d55eb1ea4a84f9a14c86))

## [2.7.3](https://github.com/hildebro/laneh/compare/v2.7.2...v2.7.3) (2026-05-01)


### Bug Fixes

* remove redundant code for price formatter ([4d48a05](https://github.com/hildebro/laneh/commit/4d48a0544d9b2819d1d16260e59d5190fbaeb4d5))

## [2.7.2](https://github.com/hildebro/laneh/compare/v2.7.1...v2.7.2) (2026-05-01)


### Bug Fixes

* missing build step in actions ([58ba1e1](https://github.com/hildebro/laneh/commit/58ba1e1bc32cc18d8827ffb06f29fc1550d946c8))

## [2.7.1](https://github.com/hildebro/laneh/compare/v2.7.0...v2.7.1) (2026-05-01)


### Bug Fixes

* release action node version ([ec7580d](https://github.com/hildebro/laneh/commit/ec7580dd38baf7c363b46d39f634bebb1e88ff10))

# [2.7.0](https://github.com/hildebro/laneh/compare/v2.6.1...v2.7.0) (2026-05-01)


### Features

* automated android release ([f68c93d](https://github.com/hildebro/laneh/commit/f68c93d7b3aedfb68204f1d4943a21cabc2f306b))

## [2.6.1](https://github.com/hildebro/laneh/compare/v2.6.0...v2.6.1) (2026-04-30)


### Bug Fixes

* pull to refresh moving content around ([c66c46e](https://github.com/hildebro/laneh/commit/c66c46e169c62619d114940917a155fb3f570904))

# [2.6.0](https://github.com/hildebro/laneh/compare/v2.5.2...v2.6.0) (2026-04-30)


### Bug Fixes

* demo button spacing ([56a01c3](https://github.com/hildebro/laneh/commit/56a01c33e4bb0452c2b968b28c3fbb519a4403fc))
* path handling and POST handling ([28ca826](https://github.com/hildebro/laneh/commit/28ca82609704d463ffa923e1edd314f70e3c9fa0))


### Features

* add demo mode ([1a68849](https://github.com/hildebro/laneh/commit/1a68849291008ce6101d2f3e646ff264431b0d9d))
* mocks for all GET endpoints ([1541f0a](https://github.com/hildebro/laneh/commit/1541f0a19bc9dc71574d5dc6acd9539000c4d48d))

## [2.5.2](https://github.com/hildebro/laneh/compare/v2.5.1...v2.5.2) (2026-04-28)


### Bug Fixes

* requests without data failing due to content type ([36d2796](https://github.com/hildebro/laneh/commit/36d2796dc2bef687273b13bd6224babbff51581b))

## [2.5.1](https://github.com/hildebro/laneh/compare/v2.5.0...v2.5.1) (2026-04-28)


### Bug Fixes

* item names with spaces are not trimmed correctly ([8753ef8](https://github.com/hildebro/laneh/commit/8753ef8aed92d7302422354da9d1b87f66ccd2db))

# [2.5.0](https://github.com/hildebro/laneh/compare/v2.4.1...v2.5.0) (2026-04-27)


### Bug Fixes

* no additional overscroll ([4e7894e](https://github.com/hildebro/laneh/commit/4e7894ee874e21f2e91c0dcb6bd32926003bd1b7))


### Features

* refresher for app ([ca08e2b](https://github.com/hildebro/laneh/commit/ca08e2bd56a262d2e1cf14e99c4fc5bd5cf27083))

## [2.4.1](https://github.com/hildebro/laneh/compare/v2.4.0...v2.4.1) (2026-04-26)


### Bug Fixes

* android mixed content and cors issues ([9683b8b](https://github.com/hildebro/laneh/commit/9683b8bbf024f581c90396a1ef787c3667efab0e))

# [2.4.0](https://github.com/hildebro/laneh/compare/v2.3.2...v2.4.0) (2026-04-24)


### Features

* token handling for android ([09ffdfb](https://github.com/hildebro/laneh/commit/09ffdfba299998e56f671b6af7b244e110923b7a))

## [2.3.2](https://github.com/hildebro/laneh/compare/v2.3.1...v2.3.2) (2026-04-20)


### Bug Fixes

* missing import ([feac07e](https://github.com/hildebro/laneh/commit/feac07e244fa7259a8a2b97fa3603a9a6c74fdb2))

## [2.3.1](https://github.com/hildebro/laneh/compare/v2.3.0...v2.3.1) (2026-04-20)


### Bug Fixes

* node and static build, based on env ([ed8e70f](https://github.com/hildebro/laneh/commit/ed8e70f7e0f551102df0ab0a6836993ed0418917))

# [2.3.0](https://github.com/hildebro/laneh/compare/v2.2.0...v2.3.0) (2026-04-20)


### Bug Fixes

* correct icon.ico target ([8790120](https://github.com/hildebro/laneh/commit/8790120c726a8e875985f4b9e85615af4bc0d13d))
* hard-coded server url for capacitor ([ab65c5f](https://github.com/hildebro/laneh/commit/ab65c5feb52fc1c3cb27c2784b912013bda55a0b))
* header padding ([60c9b68](https://github.com/hildebro/laneh/commit/60c9b680aef7a9027a12035e9f6921753ca6342a))
* status bar clearing for public pages ([40d179b](https://github.com/hildebro/laneh/commit/40d179b79cf336a4732fdc184dde86e4608fdbb1))


### Features

* add android build ([4ea7584](https://github.com/hildebro/laneh/commit/4ea758498823ad2a948096ed2fe4c2a930657b4d))
* exit button for server instance ([e6b64e7](https://github.com/hildebro/laneh/commit/e6b64e76d2d817eb4e73af4c02abe02532057768))
* handle non valid input in server-picker ([60dcd03](https://github.com/hildebro/laneh/commit/60dcd039873f3721f56b58ba70af0731f7966826))
* more detailed error message on server picker ([f0f4a23](https://github.com/hildebro/laneh/commit/f0f4a239252ecdf1bf8ef56262a5f0fa4e1fa1ae))
* prepare for app version ([dba1083](https://github.com/hildebro/laneh/commit/dba10837dd35906da1c04487c27b4d69dca59d6c))
* timeout for api helper ([a0c59f9](https://github.com/hildebro/laneh/commit/a0c59f958b0fa44fedd20c684e45172258a263a2))

# [2.2.0](https://github.com/hildebro/laneh/compare/v2.1.0...v2.2.0) (2026-04-20)


### Features

* remove base path ([457d791](https://github.com/hildebro/laneh/commit/457d791d4b320c8168c0d1ccebda56f0d8ee3858))

# [2.1.0](https://github.com/hildebro/laneh/compare/v2.0.0...v2.1.0) (2026-04-19)


### Features

* rename to laneh ([0f161ee](https://github.com/hildebro/laneh/commit/0f161ee2291dd0d9272146eb145a9a4c955e1ab5))

# [2.0.0](https://github.com/hildebro/chorehub/compare/v1.12.1...v2.0.0) (2026-04-18)


### Bug Fixes

* commit staged items in the same request, if possible ([1d73fd6](https://github.com/hildebro/chorehub/commit/1d73fd6e4cf43801ff9867851811dadeebbcc5c8))
* display validations ([f606c76](https://github.com/hildebro/chorehub/commit/f606c76aedb1998f9d0ca5986567e65b52fdd7f6))
* edit single tasks not working on completed list ([2b5b435](https://github.com/hildebro/chorehub/commit/2b5b435131e05c4d5315c82f88b3ba45bc09d7a6))
* initiate page calling protected route ([2212625](https://github.com/hildebro/chorehub/commit/2212625a1a4ef025ddd8da2d8fca5854ae497c1c))
* money input working with API approach ([39b176c](https://github.com/hildebro/chorehub/commit/39b176c44945bf27340917fd66f7c056fca3a096))
* move loggedInUser and login to public ([0769466](https://github.com/hildebro/chorehub/commit/07694668ce5b8f26f23d362ccd1d56e93dc59587))
* new resolve call for authenticated group ([cb8b21e](https://github.com/hildebro/chorehub/commit/cb8b21e5afa89b38073872ecaefe38baa2352040))
* proper zod error for invalid credentials ([fbeb621](https://github.com/hildebro/chorehub/commit/fbeb621477e155f962f7935648602787b2613f49))
* remove effect for distribution page ([c99c46a](https://github.com/hildebro/chorehub/commit/c99c46a13248b66fc9caafb785562f3a0a5ba509))
* types in balance view ([7bf2f89](https://github.com/hildebro/chorehub/commit/7bf2f89e047718d7e2e13fe7b1d516b7d9f71301))


### chore

* remove return url handling ([f980df3](https://github.com/hildebro/chorehub/commit/f980df3bf3adb4e4dc6cff26c749d2c3337872c5))


### Features

* add (authenticated) group ([b095a2c](https://github.com/hildebro/chorehub/commit/b095a2c5b981a71b1dbac6ba378d5f5e773d2d78))
* add authentication to non-public routes ([f2d5109](https://github.com/hildebro/chorehub/commit/f2d510972cd5558ba14bb6fc70e4430374ba505b))
* add logged-in user to hono env ([ceacf4a](https://github.com/hildebro/chorehub/commit/ceacf4a2fe48959ca8d8aa45cd44cd6372f1e142))
* additionalButtons and onSuccess for ApiForm ([0421e39](https://github.com/hildebro/chorehub/commit/0421e3914442e64f62f31ac1201ecb59fda6dc8d))
* disable ssr globally ([23f1b38](https://github.com/hildebro/chorehub/commit/23f1b382f8b198cfb52bda2d78446cfc75f3533c))
* include hono ([f2000c9](https://github.com/hildebro/chorehub/commit/f2000c973fb731f467b6bcc02631373f3b924170))
* migrate / + href fixes ([287dbf0](https://github.com/hildebro/chorehub/commit/287dbf04ea519ea77f78bc7426860fb51f44df1c))
* migrate /balance ([9e1a190](https://github.com/hildebro/chorehub/commit/9e1a190becb7b62206f67ab57a11f139dd527eba))
* migrate /balance/[entry] ([05ab643](https://github.com/hildebro/chorehub/commit/05ab643a654df360d3c2253c2ffc0189838b7427))
* migrate /item/add load ([8621511](https://github.com/hildebro/chorehub/commit/86215110fc049f6baa8ba973d7d9ddf60d3df02a))
* migrate /item/add post ([77d17e5](https://github.com/hildebro/chorehub/commit/77d17e5c7288bd1dffe24537e2a4673e33eac74a))
* migrate /login ([56151a6](https://github.com/hildebro/chorehub/commit/56151a6d5ea41a0d6aec579df7de158dc3a75d19))
* migrate /shopping ([fe91b2e](https://github.com/hildebro/chorehub/commit/fe91b2e01479666ec11f6aa937651548be5936ef))
* migrate /tasks user fetching ([f74d41c](https://github.com/hildebro/chorehub/commit/f74d41cb3112225c1a955b4c51f05d1173471d95))
* migrate cancel ([042bc94](https://github.com/hildebro/chorehub/commit/042bc944559b9b95b69ce7f614aa61fb67100891))
* migrate category crud ([88fa520](https://github.com/hildebro/chorehub/commit/88fa520b0e3167f06d03282d6d17a4ab5b2e5019))
* migrate category up/down ([7fe1dc6](https://github.com/hildebro/chorehub/commit/7fe1dc64b3feedcd72646d04bcac777bb3e88567))
* migrate common stuff to root layout ([226dea4](https://github.com/hildebro/chorehub/commit/226dea41cf12413345842ff435886aa155483d70))
* migrate deactivate items ([21f596c](https://github.com/hildebro/chorehub/commit/21f596c7f0fd945a8404b370774c1152f5a6a6a8))
* migrate distributions ([9d5850e](https://github.com/hildebro/chorehub/commit/9d5850ef919d4d7f265d679a03025061d4340d2b))
* migrate handleUser hook ([3023c8b](https://github.com/hildebro/chorehub/commit/3023c8b572e3cc44e35da44e872a4f89ab161462))
* migrate import db ([daea7ae](https://github.com/hildebro/chorehub/commit/daea7ae1d4e891d7e9f4d1d7c1bc87ba1ae7408b))
* migrate item categorize ([7fc5ec5](https://github.com/hildebro/chorehub/commit/7fc5ec50192f0eedd70862bdbbfb345ce69c6caa))
* migrate item delete ([687e561](https://github.com/hildebro/chorehub/commit/687e561aba7553d2be3cafc74e423a18c36af204))
* migrate logout ([3eb5b0f](https://github.com/hildebro/chorehub/commit/3eb5b0fd83a70972220189ff7005d2abf5c4de1f))
* migrate purchase list ([4b70cb7](https://github.com/hildebro/chorehub/commit/4b70cb7082cace1607c1c3b177b0e214114ca0f2))
* migrate register ([c0f82c7](https://github.com/hildebro/chorehub/commit/c0f82c7af116e6cb1aa0d709bcb6d0442313864a))
* migrate setCategory ([091f50e](https://github.com/hildebro/chorehub/commit/091f50e675df2862d402c026a95ca29fe3b3d5a9))
* migrate shopping load ([0373a8e](https://github.com/hildebro/chorehub/commit/0373a8e062db84d36d1ba858beb04d2d294fd2e0))
* migrate task done action ([e4abc00](https://github.com/hildebro/chorehub/commit/e4abc00d7aafa1dc5a2113b2d9b1d97953765fba))
* migrate updateUser ([28761de](https://github.com/hildebro/chorehub/commit/28761deae3e81368e52e39459babd40a31380a68))
* migrate weekly tasks ([b676003](https://github.com/hildebro/chorehub/commit/b676003fae694aebec89475c99675f4f065646af))
* move database transaction to hono ([de09397](https://github.com/hildebro/chorehub/commit/de093974a8ac96e64321d524a5c7482045464e6f))
* move due tasks into layout.ts ([7893a66](https://github.com/hildebro/chorehub/commit/7893a6628648bfd1fa2621712fe6f35220e7386d))
* purchase (un)staging ([acb48f7](https://github.com/hildebro/chorehub/commit/acb48f7cc4d1f615ad912e60e73908989cc200c3))
* purchase commit ([f80edb2](https://github.com/hildebro/chorehub/commit/f80edb20c92d85a5b0749a1ba6b5f027ac4f79c7))
* split initiation into public route, away from register ([316b36a](https://github.com/hildebro/chorehub/commit/316b36a19cae9d9b4da67f4362558ca28b417111))
* switch /tasks load to api ([5cad06c](https://github.com/hildebro/chorehub/commit/5cad06c3b222257d8a16e69281dac6c9f0972956))
* switch paraglide to localStorage ([b6c75d8](https://github.com/hildebro/chorehub/commit/b6c75d8f03e3d77fc1faebc601628a1d4bbbd0df))
* switch to api setup for task ([cf7a15f](https://github.com/hildebro/chorehub/commit/cf7a15fd3afd8f801301e77038ce06d2d4d3c9cc))


### BREAKING CHANGES

* mobile shell has no more exit

## [1.12.1](https://github.com/hildebro/chorehub/compare/v1.12.0...v1.12.1) (2026-04-10)


### Bug Fixes

* unable to refresh with pull ([941401c](https://github.com/hildebro/chorehub/commit/941401c4132041e3e7a0797146b29d1af86944d9))

# [1.12.0](https://github.com/hildebro/chorehub/compare/v1.11.3...v1.12.0) (2026-04-04)


### Bug Fixes

* hard to read anchor font color in dark mode ([24ca49a](https://github.com/hildebro/chorehub/commit/24ca49a2561306f7c7af29cf4762264ee0c901ee))
* margin for h2 as non-first items ([4533901](https://github.com/hildebro/chorehub/commit/453390143bed72f18e15d37ccba895e31668e860))
* only count due single tasks in header ([94d80fe](https://github.com/hildebro/chorehub/commit/94d80fefad622c6d8c8ebac5d91d1ca42463152f))
* remove debugging delay from category swap ([0ce2935](https://github.com/hildebro/chorehub/commit/0ce29358b31bdaee8a3cde107b080ed744a204ae))


### Features

* dark mode switch in settings ([a9268eb](https://github.com/hildebro/chorehub/commit/a9268eb9b6f0b1ec32ebb66f03e5cc8e2fd03732))

## [1.11.3](https://github.com/hildebro/chorehub/compare/v1.11.2...v1.11.3) (2026-04-03)


### Bug Fixes

* docker hub repo name ([68b8acd](https://github.com/hildebro/chorehub/commit/68b8acd1ddb03459aad5a70f24c5df0d79f5d70d))

## [1.11.2](https://github.com/hildebro/chorehub/compare/v1.11.1...v1.11.2) (2026-04-03)


### Bug Fixes

* another remove DATABASE_URL check for build stage ([6993238](https://github.com/hildebro/chorehub/commit/69932387c43e65706107f0342f653a659cb84a9d))

## [1.11.1](https://github.com/hildebro/chorehub/compare/v1.11.0...v1.11.1) (2026-04-03)


### Bug Fixes

* remove DATABASE_URL check for build stage ([74f9af8](https://github.com/hildebro/chorehub/commit/74f9af880b843b91297abd77495f131186a6bdbd))

# [1.11.0](https://github.com/hildebro/chorehub/compare/v1.10.0...v1.11.0) (2026-04-03)


### Bug Fixes

* update env examples ([6e86b0d](https://github.com/hildebro/chorehub/commit/6e86b0dda292b5ee5ea3208837bf724a9e29a72b))


### Features

* automated docker release ([2fd15e1](https://github.com/hildebro/chorehub/commit/2fd15e1f0232c0d49a96b42fa8f8c60867bf2c29))

# [1.10.0](https://github.com/hildebro/chorehub/compare/v1.9.2...v1.10.0) (2026-04-02)


### Features

* define port and db location via env ([e866315](https://github.com/hildebro/chorehub/commit/e86631506a73476ed7680d4173445b0b0838a73a))

## [1.9.2](https://github.com/hildebro/chorehub/compare/v1.9.1...v1.9.2) (2026-04-02)


### Bug Fixes

* remove migrator ([7c7a525](https://github.com/hildebro/chorehub/commit/7c7a525b5af285e09a9199fc7e42b7f9d8dd9dc1))

## [1.9.1](https://github.com/hildebro/chorehub/compare/v1.9.0...v1.9.1) (2026-04-02)


### Bug Fixes

* image full path ([8fd78ec](https://github.com/hildebro/chorehub/commit/8fd78ec63bb74e5087ae050500d5b82afed47f53))

# [1.9.0](https://github.com/hildebro/chorehub/compare/v1.8.1...v1.9.0) (2026-04-02)


### Bug Fixes

* bin scripts ([0888e69](https://github.com/hildebro/chorehub/commit/0888e69a45b0c19070f92bf8188a60c05b5fbd70))


### Features

* change dev docker ([9a956e0](https://github.com/hildebro/chorehub/commit/9a956e03870668702b3aa5af8bf39796d4a8c8a4))
* change prod docker compose to use docker hub ([85685eb](https://github.com/hildebro/chorehub/commit/85685ebfe4fe6b4e55e4f871d64947612a46e3f2))

## [1.8.1](https://github.com/hildebro/chorehub/compare/v1.8.0...v1.8.1) (2026-04-02)


### Bug Fixes

* gradient to viewport ([7c219f3](https://github.com/hildebro/chorehub/commit/7c219f3befe514898f1a06b9be66943be7df180b))
* overscroll into white ([ddca9d3](https://github.com/hildebro/chorehub/commit/ddca9d361b961e60784960a243990caf3ac959f2))

# [1.8.0](https://github.com/hildebro/chorehub/compare/v1.7.0...v1.8.0) (2026-04-02)


### Bug Fixes

* date nullable ([ca18d0c](https://github.com/hildebro/chorehub/commit/ca18d0cf32b2c7040c991488dae8db1d9a53dce6))
* rename weekly function ([8d89373](https://github.com/hildebro/chorehub/commit/8d89373e0bbc7453948fdc3316a0c04f4ab85e06))
* table name ([2b83967](https://github.com/hildebro/chorehub/commit/2b839671eea5438f0464d61ef89a0714428925be))


### Features

* add `done` flag to single tasks ([486c488](https://github.com/hildebro/chorehub/commit/486c48844d8911cae57dee54a6744db94d0089b0))
* add single task to database ([b7c9ee6](https://github.com/hildebro/chorehub/commit/b7c9ee6e71c7bb2f9cc15dd66b481b2c471ded9e))
* allow single task without assignee ([1e2766e](https://github.com/hildebro/chorehub/commit/1e2766eed30d8dbc91b2991e2b66b98efdd16956))
* completed tasks section ([a5360b7](https://github.com/hildebro/chorehub/commit/a5360b768f7ba96df69d25ed2d529248c79cddfc))
* completions by user into edit page ([8ee24e1](https://github.com/hildebro/chorehub/commit/8ee24e16893c07a2da62b66826907162862af94b))
* correct display of single tasks ([b382224](https://github.com/hildebro/chorehub/commit/b3822248fc3536ee171f36c589ae0db625cb320e))
* create new single tasks ([49fbf53](https://github.com/hildebro/chorehub/commit/49fbf539c12801acba1aca9a44dbec07838dbc52))
* don't show completions on single tasks ([60d06ae](https://github.com/hildebro/chorehub/commit/60d06ae8ecd8efe7bcda0bd1f94e2726d4b50a98))
* enable "done" for single tasks ([b71c8a9](https://github.com/hildebro/chorehub/commit/b71c8a98a63bc910b10abfec7949f0a1ab4f9bb3))
* fix global counter for open tasks ([d1877ae](https://github.com/hildebro/chorehub/commit/d1877aef6be039721d24118e5d6ef06b2a77233c))
* move weekly task to subpath ([b2269fe](https://github.com/hildebro/chorehub/commit/b2269fe5ee7a98e21fe9627ea4b57042c0b6fbc1))
* new generic TaskWithRelation ([766d239](https://github.com/hildebro/chorehub/commit/766d239f344951a10df7c4239f3800d9be08397b))
* remove upcoming category ([8b9268d](https://github.com/hildebro/chorehub/commit/8b9268dd145e3899ac31529fe54ae1e3d6da762c))
* rename weekly task labels ([486df39](https://github.com/hildebro/chorehub/commit/486df39881f4afd418d677e6590be0c997974f5b))
* rename weekly task props ([64e3568](https://github.com/hildebro/chorehub/commit/64e35681a41b97f6211f1e1e10b38cb0fe1b4ddd))

# [1.7.0](https://github.com/hildebro/chorehub/compare/v1.6.0...v1.7.0) (2026-03-29)


### Features

* background gradient ([a7dfd72](https://github.com/hildebro/chorehub/commit/a7dfd724f286ef71be56783580057924ed05a5de))
* blue tint for surface ([84b01e5](https://github.com/hildebro/chorehub/commit/84b01e5ee6da22e3b2225094b89f3e4079ffb492))
* improve header and footer colors ([6c634a7](https://github.com/hildebro/chorehub/commit/6c634a708d4f75df0ed9c181d236dee78096b9e0))

# [1.6.0](https://github.com/hildebro/chorehub/compare/v1.5.2...v1.6.0) (2026-03-27)


### Bug Fixes

* center headlines between articles ([3929d40](https://github.com/hildebro/chorehub/commit/3929d4002a2294372efea70d7bdd76c48b7785ea))
* clean separation of balance and expenses ([ceb77ab](https://github.com/hildebro/chorehub/commit/ceb77ab36940b3b643df5540a8f1276652191e5d))
* remove tracked .gitignore from inlang project ([a7c0bfe](https://github.com/hildebro/chorehub/commit/a7c0bfe7f31329827682973c3a09e89aad3b520a))
* settings category only one per row ([1824c40](https://github.com/hildebro/chorehub/commit/1824c40fd39e2fed020d49a3488a670df2aced51))


### Features

* headline for item settings actions ([bbc9e17](https://github.com/hildebro/chorehub/commit/bbc9e1738e7852c0f67c8a6dc6e7296782d18576))
* restructure settings ([d26e5c0](https://github.com/hildebro/chorehub/commit/d26e5c00543e5a6cc3aa028f21bf6a58cc30649f))
* success message for forms ([ac2ce1d](https://github.com/hildebro/chorehub/commit/ac2ce1d8033c6e9867382a03f358e67716c71b44))

## [1.5.2](https://github.com/hildebro/chorehub/compare/v1.5.1...v1.5.2) (2026-03-25)


### Bug Fixes

* npm vulnerabilities ([d5b06d7](https://github.com/hildebro/chorehub/commit/d5b06d7a7db0d7b409357fce50eb9a1546b552c3))

## [1.5.1](https://github.com/hildebro/chorehub/compare/v1.5.0...v1.5.1) (2026-03-25)


### Bug Fixes

* leftover reference to old toast ([199e174](https://github.com/hildebro/chorehub/commit/199e174c4a27dba160a942a60e6a726813a24ecd))
* remove tailwind and skeleton references ([963801e](https://github.com/hildebro/chorehub/commit/963801ebf656dae1c847ae7d783930b52c30fab1))
* remove unused skeleton toaster ([156077b](https://github.com/hildebro/chorehub/commit/156077bc8cbb244b9222bfbb38a5a2f168b80078))

# [1.5.0](https://github.com/hildebro/chorehub/compare/v1.4.2...v1.5.0) (2026-03-25)


### Bug Fixes

* footer spacing ([789c1b3](https://github.com/hildebro/chorehub/commit/789c1b3de62c0414dd5411d6ed372cdb7a0b3296))
* move icon-button to app.css ([ef5c67a](https://github.com/hildebro/chorehub/commit/ef5c67a79a8154b505a775dff01bd786b807c757))
* shopping no category state ([3c7fa60](https://github.com/hildebro/chorehub/commit/3c7fa606af1a6ca331dbb1c8a9c0547c9b0dfb11))


### Features

* /shopping/item/add button colors + flex ([064608d](https://github.com/hildebro/chorehub/commit/064608d656273da75dec1eb077aed3b05bc2052a))
* add details-summary styling ([cd01852](https://github.com/hildebro/chorehub/commit/cd018526667778668c1af760d5abc3ca8a68c9a4))
* add dialog styling, use in /item/add ([1c4fdcb](https://github.com/hildebro/chorehub/commit/1c4fdcbc265274b9b6a6b598500c0e7bb9b6be87))
* add styling for main area ([e775844](https://github.com/hildebro/chorehub/commit/e775844baaea99035b24a533dfd73813bfd90894))
* base style adjustments for headings and lists ([9222e78](https://github.com/hildebro/chorehub/commit/9222e78bdde44d53cc2cb68611f90ba99b913015))
* change main layout to flex ([908ae53](https://github.com/hildebro/chorehub/commit/908ae53a5235a8a324c3ded34e05f31a16adfddb))
* class=primary for articles ([a8bc890](https://github.com/hildebro/chorehub/commit/a8bc89067ee77f11eb3273e2ee76e2f601e9c05f))
* ensure toast uses the new styles ([8b6d6fb](https://github.com/hildebro/chorehub/commit/8b6d6fb4a1f7fd530df539e1862a06434debc2db))
* fix enhanced form ([f3cf76b](https://github.com/hildebro/chorehub/commit/f3cf76b090b54804d287e54816e752560ff32383))
* fix footer styling ([000afdd](https://github.com/hildebro/chorehub/commit/000afddb95bc7638297a275990ae1e78d7f0356f))
* fix spinner ([e6abc84](https://github.com/hildebro/chorehub/commit/e6abc8424d59f8cc5d7dc00d6254b599af0d63b2))
* fix update available marker ([6f0cdde](https://github.com/hildebro/chorehub/commit/6f0cdde77851792ee1f2cc73b9fabb24af06f839))
* form input styling ([e23a84f](https://github.com/hildebro/chorehub/commit/e23a84f159b8f0da6fe5fa486c94e6e1242b6e6e))
* implement new toast ([7e86767](https://github.com/hildebro/chorehub/commit/7e8676708c520f405e2540d93f6c3c89369cade8))
* improve margins in base layout ([51052d9](https://github.com/hildebro/chorehub/commit/51052d9010efd6802fae37984b94c9ee73d1a81a))
* migrate /auth and /auth/register ([5510595](https://github.com/hildebro/chorehub/commit/5510595698e90b60c623296aa2d49ae7c2bca840))
* migrate /balance ([8175d23](https://github.com/hildebro/chorehub/commit/8175d23896cff8ef89133576f6073ccd74384fe7))
* migrate /balance/[entry] ([baed75c](https://github.com/hildebro/chorehub/commit/baed75c3f73857a5a2eb61bf76fd68c85687a1dd))
* migrate /schedule ([c59324d](https://github.com/hildebro/chorehub/commit/c59324de5cebb5ccc270e86ebe369fb62ea5fb5e))
* migrate /schedule/[task] ([2fc1273](https://github.com/hildebro/chorehub/commit/2fc1273a524b9b742a74b1ab6c593caef452f46f))
* migrate /settings ([7e84873](https://github.com/hildebro/chorehub/commit/7e848737e2710be0973c469558985b12e13d4b90))
* migrate /settings/categories ([f9bda40](https://github.com/hildebro/chorehub/commit/f9bda404b6a4a0c989345af95c2ba7e08bbc6fc3))
* migrate /settings/categories/[category] ([54a1c84](https://github.com/hildebro/chorehub/commit/54a1c84a5ebf1568e7520bd8a99e2a9dc27d5b05))
* migrate /settings/items ([74bea07](https://github.com/hildebro/chorehub/commit/74bea0725c0a84292f908d498cdec242dc3ee55f))
* migrate /settings/users ([7a1b5dc](https://github.com/hildebro/chorehub/commit/7a1b5dcb8d1713cfd449e3f9ac432fa0eca2dd9c))
* migrate /shopping ([5083641](https://github.com/hildebro/chorehub/commit/5083641ab90200378ee72220d5570b52f682c636))
* migrate /shopping/item/add ([d1f5e33](https://github.com/hildebro/chorehub/commit/d1f5e33ccdbaf7f3225797e0dca022b182b82d71))
* migrate /shopping/item/categorize ([2e92bf2](https://github.com/hildebro/chorehub/commit/2e92bf24843ce04d0f1645c55cf82ca2624a0bd3))
* migrate /shopping/purchase ([43c0665](https://github.com/hildebro/chorehub/commit/43c06656cc3d1059d77e9afb6aefad4156f9e331))
* migrate /shopping/purchase/list ([00a572c](https://github.com/hildebro/chorehub/commit/00a572c45202a0e95910a8b5985321dfa3bc9616))
* migrate dashboard ([db7378d](https://github.com/hildebro/chorehub/commit/db7378d83c2d9b7c43ee24e94252184e795e9bd3))
* more button colors ([7a91964](https://github.com/hildebro/chorehub/commit/7a919647e5a58f87eab51826dce18bcdb7e97901))
* replace enhancedform and add-item toasts ([30c9fb7](https://github.com/hildebro/chorehub/commit/30c9fb7c28a71ab9c4841c4e230c0933ac2d88a3))
* replace header ([414a921](https://github.com/hildebro/chorehub/commit/414a921c8b1ae757c0ab47b69b383c5a3c55854b))
* replace tailwind/skeleton base styles with custom classless ([0531101](https://github.com/hildebro/chorehub/commit/05311010ec3aca72b38e9aa9f735836651e1a5e6))
* switch custom color definitions to theme ([e1fb33b](https://github.com/hildebro/chorehub/commit/e1fb33b7d4553f8aa95b81cb1c4ed6ec1438bbd8))
* switch to theme coloring ([7b75257](https://github.com/hildebro/chorehub/commit/7b75257dcffa0152b1ef36b891f4d2b67c0301b5))

## [1.4.2](https://github.com/hildebro/chorehub/compare/v1.4.1...v1.4.2) (2026-03-15)


### Bug Fixes

* move dev dependencies ([34c8edc](https://github.com/hildebro/chorehub/commit/34c8edc41bfa8b69b3160cb6b37fbaf38ce96c01))
* remove unused package ([6d8968e](https://github.com/hildebro/chorehub/commit/6d8968ec1f7f207b95d65dfe9054225bd64fe200))

## [1.4.1](https://github.com/hildebro/chorehub/compare/v1.4.0...v1.4.1) (2026-03-15)


### Bug Fixes

* improve update-available footer ([79114d6](https://github.com/hildebro/chorehub/commit/79114d66ae173a136b5c50081b3fa6a1312c9126))
* resolve routes correctly ([a081892](https://github.com/hildebro/chorehub/commit/a081892ce7a1e1064b5fb4c4a63760c3ab5b5ef8))

# [1.4.0](https://github.com/hildebro/chorehub/compare/v1.3.0...v1.4.0) (2026-03-14)


### Features

* database export ([8f2e236](https://github.com/hildebro/chorehub/commit/8f2e236018f35e9a5e39fb5e99baa264d29ed925))
* database import ([096bc36](https://github.com/hildebro/chorehub/commit/096bc3697212967d0268d9e61f8b17e5c70870a8))

# [1.3.0](https://github.com/hildebro/chorehub/compare/v1.2.0...v1.3.0) (2026-03-14)


### Features

* db-migrator in docker prod ([5bfa8d0](https://github.com/hildebro/chorehub/commit/5bfa8d065551c65d49d78838fbf4c571a2449d18))

# [1.2.0](https://github.com/hildebro/chorehub/compare/v1.1.2...v1.2.0) (2026-03-14)


### Features

* notify about new version ([c08891d](https://github.com/hildebro/chorehub/commit/c08891d678e2d8a9fdaa6126f6a434fc55264af8))

## [1.1.2](https://github.com/hildebro/chorehub/compare/v1.1.1...v1.1.2) (2026-03-12)


### Bug Fixes

* state to derived in usages of props.data ([77cab3b](https://github.com/hildebro/chorehub/commit/77cab3b864f6425ce90d772d6cee0b2ce21043a1))

## [1.1.1](https://github.com/hildebro/chorehub/compare/v1.1.0...v1.1.1) (2026-03-04)


### Bug Fixes

* move add-user to main settings ([01c5234](https://github.com/hildebro/chorehub/commit/01c5234fd700458edfd44c9e1b2715f375318312))
* move locale picker to main settings ([fda0297](https://github.com/hildebro/chorehub/commit/fda0297e1cf8f74cbaa4b0e3b004797cb19447d9))
* move logout to main settings page ([af981ac](https://github.com/hildebro/chorehub/commit/af981ac62b731681f5e80add3ed333ad71a63d35))
* remove broken user switch ([6684ed2](https://github.com/hildebro/chorehub/commit/6684ed2cee7cdde364d5dc08569adf862d2a9455))

# [1.1.0](https://github.com/hildebro/chorehub/compare/v1.0.0...v1.1.0) (2026-03-04)


### Features

* add mobile-exit to auth page ([6f740fa](https://github.com/hildebro/chorehub/commit/6f740fa0b7eddbd251580a8fa4c8f171ca5756c6))
* add mobile-exit to settings ([2cdec7b](https://github.com/hildebro/chorehub/commit/2cdec7bc1d59d6977698b376cb0d72847492dbac))
* show app version in footer ([c1cff5d](https://github.com/hildebro/chorehub/commit/c1cff5d38b86bd8fc83322c3cf1d5aef673a35d3))

# 1.0.0 (2026-03-04)


### Bug Fixes

* when adding item suggestions, make sure an empty line for input will be there ([76c2c4b](https://github.com/hildebro/chorehub/commit/76c2c4bf8ae37ac021fa67e66105f40b03df5266))
