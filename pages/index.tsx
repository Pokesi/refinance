import	React, {ReactElement}			from	'react';
import	Image							from	'next/image';
import	Link							from	'next/link';
import	{motion}						from	'framer-motion';
import	{Button, Card, Dropdown}					from	'@yearn-finance/web-lib/components';
import	* as utils						from	'@yearn-finance/web-lib/utils';
import	useYearn						from	'contexts/useYearn';
import type {TVault}					from	'contexts/useYearn.d';

function	VaultCard({currentVault}: {currentVault: TVault}): ReactElement {
	const slashMotion = {
		rest: {x: -8, y: -8},
		hover: {x: -4, y: -4}
	};

	return (
		<div className={'w-full'}>
			<Link href={`/vault/${currentVault.address}`}>
				<Card className={'col-span-1 md:col-span-3'} padding={'none'}>
					<motion.div initial={'rest'} whileHover={'hover'} animate={'rest'} className={'cursor-pointer'}>
						<motion.div
							variants={slashMotion}
							className={'flex flex-col justify-between items-start p-6 pb-4 macarena--vaultCard'}>
							<div className={'flex flex-row justify-between items-start w-full'}>
								<div className={'min-w-[32px] min-h-[32px] md:min-w-[80px] md:min-h-[80px]'}>
									<Image
										src={currentVault.token.icon}
										width={80}
										height={80} />
								</div>
								<div className={'flex flex-col text-right'}>
									<p className={'text-xs text-neutral-700'}>{'APY'}</p>
									<b className={'text-4xl'}>{Number((currentVault.apy.net_apy * 100).toFixed(2)) === 0 ? '-' : `${utils.format.amount(currentVault.apy.net_apy * 100, 2, 2)}%`}</b>
								</div>
							</div>
							<div>
								{Number((currentVault.apy.net_apy * 100).toFixed(2)) > 0 ?
									<h2 className={'mt-1 text-lg font-bold md:text-5xl text-neutral-700'}>
										{currentVault.token.display_name || currentVault.token.name}
									</h2> :
									<h2 className={'mt-1 text-lg font-bold md:text-5xl text-amber-600'} style={{color: 'red', fontSize: '21px'}}>
										{currentVault.token.display_name || currentVault.token.name} {'| Not earning...'}
									</h2>
								}
							</div>
						</motion.div>

						<div className={'p-4 space-y-6 md:p-6'}>
							<div>
								<p className={'text-sm text-neutral-700'}>{'TVL'}</p>
								<b className={'text-4xl'}>{`$${utils.format.amount(currentVault.tvl.tvl / 1000_000, 2, 2)}m`}</b>
							</div>

							<div>
								<b className={'text-sm text-neutral-700'}>{'Annualized Growth'}</b>
								<div className={'grid grid-cols-3 gap-4 mt-2'}>
									<div className={'flex flex-col'}>
										<p className={'text-xs text-neutral-700/70'}>{'Last 7 days'}</p>
										<b className={'text-neutral-700'}>{`${utils.format.amount(currentVault.apy.points.week_ago * 100, 2, 2)}%`}</b>
									</div>
									<div className={'flex flex-col'}>
										<p className={'text-xs text-neutral-700/70'}>{'Last 30 days'}</p>
										<b className={'text-neutral-700'}>{`${utils.format.amount(currentVault.apy.points.month_ago * 100, 2, 2)}%`}</b>
									</div>
									<div className={'flex flex-col'}>
										<p className={'text-xs text-neutral-700/70'}>{'All Time'}</p>
										<b className={'text-neutral-700'}>{`${utils.format.amount(currentVault.apy.points.inception * 100, 2, 2)}%`}</b>
									</div>
								</div>
							</div>

							<div>
								<Button className={'min-w-[136px]'}>
									{'Jump in!'}
								</Button>
							</div>
						</div>
					</motion.div>
				</Card>
			</Link>
		</div>
	);
}

function	Vaults({vaults}: {vaults: TVault[]}): ReactElement {
	return (
		<div className={'grid grid-cols-1 gap-6 md:grid-cols-3'}>
			{
				vaults.map((currentVault: TVault): ReactElement => {
					return (
						<VaultCard key={currentVault.address} currentVault={currentVault} />
					);
				})
			}
		</div>
	);
}

type TDropdownOption = {
	value: string | number;
	label: string;
};

function	Index(): ReactElement {
	const	defaultSelectedCategories = {usdStable: false, blueChip: false, simpleSavers: false, curve: false};
	const	{vaults, nonce: dataNonce} = useYearn();
	const	[filteredVaults, set_filteredVaults] = React.useState<TVault[]>([]);
	const	[selectedCategories, set_selectedCategories] = React.useState({...defaultSelectedCategories, simpleSavers: true});

	const	options: TDropdownOption[] = [
		{label: 'Sort by TVL', value: 0},
		{label: 'Sort by APY', value: 1},
		{label: 'Default Sort', value: 2}
	];

	console.log(vaults);

	const [filterBy, set_filterBy] = React.useState(options[0]);

	const [tvl, set_tvl] = React.useState(0);
	/* ♻ - ReFinance ***********************************************************
	** filterBy dict:
	** 0 - tvl
	** 1 - apy
	** 2 - default
	**************************************************************************/

	/* 🔵 - Yearn Finance ******************************************************
	** This effect is triggered every time the vault list or the search term is
	** changed, or the delta selector is updated. It filters the pairs based on
	** that to only work with them.
	** ♻ - ReFinance
	** Added filterBy change :P
	**************************************************************************/
	React.useEffect((): void => {
		let progTvl = 0;
		//for (let i=0; i < vaults.length; i++) {
		for (const vault of vaults) {
			progTvl += vault.tvl.tvl;
		}
		set_tvl(progTvl);
		let		_filteredVaults = [...vaults];
		_filteredVaults = _filteredVaults.filter((vault): boolean => (
			(selectedCategories.simpleSavers && vault.categories.includes('simple_saver'))
			|| (selectedCategories.usdStable && vault.categories.includes('usd_stable'))
			|| (selectedCategories.blueChip && vault.categories.includes('blue_chip'))
			|| (selectedCategories.curve && vault.categories.includes('curve'))
		));
		if (filterBy.value === 0) {
			_filteredVaults = _filteredVaults.sort((a, b): number => b.tvl.tvl - a.tvl.tvl);
			set_filteredVaults(_filteredVaults);
		} else if (filterBy.value === 1) {
			_filteredVaults = _filteredVaults.sort((a, b): number => b.apy.net_apy - a.apy.net_apy);
			set_filteredVaults(_filteredVaults);
		}
		utils.performBatchedUpdates((): void => {
			set_filteredVaults(_filteredVaults);
		});
		//});
	}, [dataNonce, vaults, selectedCategories, filterBy]);

	/* 🔵 - Yearn Finance ******************************************************
	** Main render of the page.
	**************************************************************************/
	return (
		<div className={'z-0 pb-10 w-full md:pb-20'}>
			<div aria-label={'filters'} className={'flex flex-row justify-center items-center mb-7 -ml-1 space-x-2 md:ml-0'}>
				<Dropdown
					defaultOption={options[0]}
					options={options}
					selected={filterBy}
					onSelect={(option: TDropdownOption): void => set_filterBy(options[option.value as number])}
					className={'z-999'}/>
				<button
					aria-selected={selectedCategories.simpleSavers}
					onClick={(): void => set_selectedCategories({...defaultSelectedCategories, simpleSavers: true})}
					className={'flex justify-center items-center px-2 h-8 border transition-colors cursor-pointer rounded-default macarena--filter'}>
					<p className={'text-xs md:text-base'}>{'Simple Savers'}</p>
				</button>
				<button
					aria-selected={selectedCategories.usdStable}
					onClick={(): void => set_selectedCategories({...defaultSelectedCategories, usdStable: true})}
					className={'flex justify-center items-center px-2 h-8 border transition-colors cursor-pointer rounded-default macarena--filter'}>
					<p className={'text-xs md:text-base'}>{'USD Stables'}</p>
				</button>
				<button
					aria-selected={selectedCategories.blueChip}
					onClick={(): void => set_selectedCategories({...defaultSelectedCategories, blueChip: true})}
					className={'flex justify-center items-center px-2 h-8 border transition-colors cursor-pointer rounded-default macarena--filter'}>
					<p className={'text-xs md:text-base'}>{'Blue Chips'}</p>
				</button>
				<button
					aria-selected={selectedCategories.curve}
					onClick={(): void => set_selectedCategories({...defaultSelectedCategories, curve: true})}
					className={'flex justify-center items-center px-2 h-8 border transition-colors cursor-pointer rounded-default macarena--filter'}>
					<p className={'text-xs md:text-base'}>{'Curve Pools'}</p>
				</button>
			</div>

			<h1 style={{
				textAlign: 'center'
			}}>{`$${tvl.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} TVL`}</h1>
			<br />

			<Vaults vaults={filteredVaults} />
		</div>
	);
}

export default Index;
