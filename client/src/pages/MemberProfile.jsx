import { useParams, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Calendar, Activity, CreditCard, Utensils, Dumbbell, ArrowLeft, Edit } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { clsx } from "clsx";
import { useState, useEffect } from 'react';
import * as memberService from '../services/memberService';
import * as workoutPlanService from '../services/workoutPlanService';
import * as dietPlanService from '../services/dietPlanService';
import { useNotification } from '../hooks/useNotification';
import { formatDate } from '../utils/formatDate';
import { formatCurrency } from '../utils/formatCurrency';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/common/Table';
import { useRole } from '../hooks/useRole';
import { GENDER_OPTIONS } from '../utils/constants';
import * as paymentService from '../services/paymentService';

const MemberProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isSuperAdmin, isOwner, isStaff } = useRole();
    const { success: showSuccess, error: showError } = useNotification();
    const [activeTab, setActiveTab] = useState('activity');
    const [member, setMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [dietPlans, setDietPlans] = useState([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [payments, setPayments] = useState([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(false);
    const [paymentsLoaded, setPaymentsLoaded] = useState(false);

    useEffect(() => {
        if (id) {
            loadMember();
        }
    }, [id]);

    useEffect(() => {
        if (member && (isOwner() || isStaff() || isSuperAdmin())) {
            loadTemplates(member.gymId?._id || member.gymId);
        }
    }, [member]);

    const loadTemplates = async (gymId) => {
        try {
            const params = gymId ? { gymId } : {};
            const [workoutRes, dietRes] = await Promise.all([
                workoutPlanService.getWorkoutPlans(params),
                dietPlanService.getDietPlans(params)
            ]);
            setWorkoutPlans(workoutRes.data?.data || []);
            setDietPlans(dietRes.data?.data || []);
        } catch (error) {
            console.error('Failed to load templates:', error);
        }
    };

    const loadPayments = async () => {
        setIsLoadingPayments(true);
        try {
            const response = await paymentService.getPayments({ memberId: member._id, limit: 100 });
            setPayments(response.data?.data?.payments || response.data?.payments || response.data?.data || []);
            setPaymentsLoaded(true);
        } catch (error) {
            console.error('Failed to load payments:', error);
            showError('Failed to load payment history');
        } finally {
            setIsLoadingPayments(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'payments' && member && !paymentsLoaded) {
            loadPayments();
        }
    }, [activeTab, member, paymentsLoaded]);

    const handleAssignPlan = async (type, planId) => {
        if (!planId) return;
        try {
            setIsAssigning(true);
            if (type === 'workout') {
                await workoutPlanService.assignWorkoutPlan(planId, [member._id]);
            } else {
                await dietPlanService.assignDietPlan(planId, [member._id]);
            }
            await loadMember(); // reload to get populated plan
            showSuccess('Plan assigned successfully'); // Notice using showError for success? NO, use generic or showSuccess
        } catch (error) {
            console.error('Failed to assign plan:', error);
        } finally {
            setIsAssigning(false);
        }
    };

    const loadMember = async () => {
        setIsLoading(true);
        try {
            const response = await memberService.getMember(id);
            const memberData = response.data?.data || response.data;
            setMember(memberData);
        } catch (error) {
            showError('Failed to load member details');
            navigate('/members');
        } finally {
            setIsLoading(false);
        }
    };

    const tabs = [
        { id: 'activity', label: 'Activity Log', icon: Activity },
        { id: 'payments', label: 'Payment History', icon: CreditCard },
        { id: 'diet', label: 'Diet Plan', icon: Utensils },
        { id: 'workout', label: 'Workout Plan', icon: Dumbbell },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!member) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">Member not found</p>
                <Button onClick={() => navigate('/members')} className="mt-4" variant="secondary">
                    <ArrowLeft size={18} className="mr-2" />
                    Back to Members
                </Button>
            </div>
        );
    }

    const user = member.userId || {};
    const plan = member.planId || {};
    const gym = member.gymId || {};
    const address = member.address || {};
    const emergencyContact = member.emergencyContact || {};
    const medicalInfo = member.medicalInfo || {};

    // Calculate days remaining
    const subscriptionEnd = new Date(member.subscriptionEnd);
    const today = new Date();
    const daysRemaining = Math.ceil((subscriptionEnd - today) / (1000 * 60 * 60 * 24));
    const totalDays = Math.ceil((subscriptionEnd - new Date(member.subscriptionStart)) / (1000 * 60 * 60 * 24));
    const progressPercentage = totalDays > 0 ? ((totalDays - daysRemaining) / totalDays) * 100 : 0;

    const profileImageUrl = member.profileImage?.url || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || id}`;
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Member';
    const memberSince = formatDate(member.subscriptionStart);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/members')}
                        className="p-2"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Member Profile</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.memberId || `ID: ${id.slice(-6)}`}</p>
                    </div>
                </div>
                {(isSuperAdmin() || isOwner()) && (
                    <Button
                        variant="secondary"
                        onClick={() => navigate(`/members?edit=${id}`)}
                    >
                        <Edit size={18} className="mr-2" />
                        Edit Member
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-6 text-center">
                        <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                            <img
                                src={profileImageUrl}
                                alt={fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || id}`;
                                }}
                            />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{fullName}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Member since {memberSince}</p>
                        {isSuperAdmin() && gym.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{gym.name}</p>
                        )}
                        <div className="mt-4 flex justify-center">
                            <Badge
                                variant={member.status === 'active' ? 'success' : member.status === 'expired' ? 'warning' : 'gray'}
                                className="px-3 py-1"
                            >
                                {member.status || 'Active'}
                            </Badge>
                        </div>

                        <div className="mt-6 space-y-4 text-left">
                            {user.email && (
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <Mail size={18} />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                            )}
                            {user.phone && (
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <Phone size={18} />
                                    <span className="text-sm">{user.phone}</span>
                                </div>
                            )}
                            {address.street && (
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <MapPin size={18} />
                                    <span className="text-sm">
                                        {[address.street, address.city, address.state, address.pincode].filter(Boolean).join(', ') || 'N/A'}
                                    </span>
                                </div>
                            )}
                            {member.gender && (
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <Calendar size={18} />
                                    <span className="text-sm">
                                        Gender: {GENDER_OPTIONS.find(opt => opt.value === member.gender)?.label || member.gender}
                                    </span>
                                </div>
                            )}
                            {member.bloodGroup && (
                                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                    <Calendar size={18} />
                                    <span className="text-sm">Blood Group: {member.bloodGroup}</span>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Current Plan</h3>
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-blue-900 dark:text-blue-300">{plan.name || 'No Plan'}</h4>
                                    {plan.price && (
                                        <p className="text-xs text-blue-700 dark:text-blue-400">${plan.price} / {plan.duration || 'month'}</p>
                                    )}
                                </div>
                                {plan.duration && (
                                    <Badge variant="primary">{plan.duration}</Badge>
                                )}
                            </div>
                            {daysRemaining > 0 && (
                                <>
                                    <div className="w-full bg-blue-200 dark:bg-blue-900/30 rounded-full h-2 mt-3">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full"
                                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 text-right">
                                        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                                    </p>
                                </>
                            )}
                            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                                <p>Start: {formatDate(member.subscriptionStart)}</p>
                                <p>End: {formatDate(member.subscriptionEnd)}</p>
                            </div>
                        </div>
                    </Card>

                    {emergencyContact.name && (
                        <Card className="p-6">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
                            <div className="space-y-2 text-sm">
                                <p className="text-gray-900 dark:text-white font-medium">{emergencyContact.name}</p>
                                {emergencyContact.relation && (
                                    <p className="text-gray-600 dark:text-gray-400">{emergencyContact.relation}</p>
                                )}
                                {emergencyContact.phone && (
                                    <p className="text-gray-600 dark:text-gray-400">{emergencyContact.phone}</p>
                                )}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2">
                    <Card className="min-h-[600px]">
                        <div className="border-b border-gray-200 dark:border-slate-700">
                            <div className="flex overflow-x-auto">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={clsx(
                                                "flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                                                isActive
                                                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                                                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300"
                                            )}
                                        >
                                            <Icon size={18} />
                                            {tab.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="p-6">
                            {activeTab === 'activity' && (
                                <div className="space-y-4">
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <Activity size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>Activity log feature coming soon.</p>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'payments' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment History</h3>
                                    {isLoadingPayments ? (
                                        <div className="flex justify-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    ) : payments.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                            <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>No payment history found.</p>
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Plan</TableHead>
                                                    <TableHead>Amount</TableHead>
                                                    <TableHead>Method</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Action</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {payments.map(payment => (
                                                    <TableRow key={payment._id}>
                                                        <TableCell>{formatDate(payment.paidAt || payment.createdAt)}</TableCell>
                                                        <TableCell>{payment.invoiceId?.planId?.name || 'Manual Payment'}</TableCell>
                                                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                                                        <TableCell className="capitalize">{payment.method?.replace('_', ' ')}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={payment.status === 'completed' ? 'success' : 'warning'}>
                                                                {payment.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right gap-2 flex justify-end">
                                                            <Button variant="ghost" size="sm" onClick={() => window.print()} title="Download Receipt">
                                                                Receipt
                                                            </Button>
                                                            {payment.invoiceId && (
                                                                <Button variant="ghost" size="sm" onClick={() => window.print()} title="Download Invoice">
                                                                    Invoice
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            )}
                            {activeTab === 'diet' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Diet Plan</h3>
                                        {(isOwner() || isStaff() || isSuperAdmin()) && (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="rounded-lg border-gray-300 dark:border-slate-700 dark:bg-slate-900 text-gray-900 dark:text-white text-sm"
                                                    onChange={(e) => handleAssignPlan('diet', e.target.value)}
                                                    value={member.assignedDietPlan?._id || ''}
                                                    disabled={isAssigning}
                                                >
                                                    <option value="" disabled>Change Plan...</option>
                                                    {dietPlans.map(p => (
                                                        <option key={p._id} value={p._id}>{p.name} {p.isDefault ? '(Default Gym Plan)' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    {member.assignedDietPlan ? (
                                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {member.assignedDietPlan.name}
                                                {member.assignedDietPlan.isDefault && <Badge variant="primary" className="ml-2">Default Plan</Badge>}
                                            </p>
                                            {member.assignedDietPlan.description && (
                                                <p className="text-sm text-gray-500 mt-1">{member.assignedDietPlan.description}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                            <Utensils size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>No specific diet plan assigned. They will see the gym's default plan.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === 'workout' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assigned Workout Plan</h3>
                                        {(isOwner() || isStaff() || isSuperAdmin()) && (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    className="rounded-lg border-gray-300 dark:border-slate-700 dark:bg-slate-900 text-gray-900 dark:text-white text-sm"
                                                    onChange={(e) => handleAssignPlan('workout', e.target.value)}
                                                    value={member.assignedWorkoutPlan?._id || ''}
                                                    disabled={isAssigning}
                                                >
                                                    <option value="" disabled>Change Plan...</option>
                                                    {workoutPlans.map(p => (
                                                        <option key={p._id} value={p._id}>{p.name} {p.isDefault ? '(Default Gym Plan)' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    {member.assignedWorkoutPlan ? (
                                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {member.assignedWorkoutPlan.name}
                                                {member.assignedWorkoutPlan.isDefault && <Badge variant="primary" className="ml-2">Default Plan</Badge>}
                                            </p>
                                            {member.assignedWorkoutPlan.description && (
                                                <p className="text-sm text-gray-500 mt-1">{member.assignedWorkoutPlan.description}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                            <Dumbbell size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>No specific workout routine assigned. They will see the gym's default plan.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MemberProfile;
