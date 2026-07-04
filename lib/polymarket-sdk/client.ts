import { HttpClient } from './http';
import { EventsModule } from './modules/events';
import { MarketsModule } from './modules/markets';
import { SearchModule } from './modules/search';
import { TagsModule } from './modules/tags';
import { ProfilesModule } from './modules/profiles';
import { PositionsModule } from './modules/positions';
import { TradesModule } from './modules/trades';
import { ActivityModule } from './modules/activity';
import { AnalyticsModule } from './modules/analytics';
import { BuildersModule } from './modules/builders';
import { HoldersModule } from './modules/holders';
import { TradersModule } from './modules/traders';

export class PolymarketClient {
    public readonly http: HttpClient;
    public readonly events: EventsModule;
    public readonly markets: MarketsModule;
    public readonly search: SearchModule;
    public readonly tags: TagsModule;
    public readonly profiles: ProfilesModule;
    public readonly positions: PositionsModule;
    public readonly trades: TradesModule;
    public readonly activity: ActivityModule;
    public readonly analytics: AnalyticsModule;
    public readonly builders: BuildersModule;
    public readonly holders: HoldersModule;
    public readonly traders: TradersModule;

    constructor() {
        this.http = new HttpClient();
        this.events = new EventsModule(this.http);
        this.markets = new MarketsModule(this.http);
        this.search = new SearchModule(this.http);
        this.tags = new TagsModule(this.http);
        this.profiles = new ProfilesModule(this.http);
        this.positions = new PositionsModule(this.http);
        this.trades = new TradesModule(this.http);
        this.activity = new ActivityModule(this.http);
        this.analytics = new AnalyticsModule(this.http);
        this.builders = new BuildersModule(this.http);
        this.holders = new HoldersModule(this.http);
        this.traders = new TradersModule(this.http);
    }
}


