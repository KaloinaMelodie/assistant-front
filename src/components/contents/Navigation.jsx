import SideBar from '../layout/SideBar';
import ConversationView from './ConversationView';

const Navigation = () => {
    return (

        <div>
            <div className="resource-guide">
                <SideBar />
                <div className="resource-guide-right-content">
                    <div className="resource-guide-content-area">
                           <ConversationView />
                    </div>
                </div>
            </div>
        </div>

    );
}
export default Navigation;