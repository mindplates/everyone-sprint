package com.mindplates.everyonesprint.biz.sprint.entity;

import com.mindplates.everyonesprint.biz.common.constants.ColumnsDef;
import com.mindplates.everyonesprint.biz.project.entity.Project;
import com.mindplates.everyonesprint.common.code.RoleCode;
import com.mindplates.everyonesprint.common.entity.CommonEntity;
import lombok.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.validator.constraints.Length;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Builder
@Table(name = "sprint")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Sprint extends CommonEntity {

    public Sprint(Long id, String name, LocalDateTime startDate, LocalDateTime endDate, LocalDateTime realEndDate, Boolean isJiraSprint, String jiraSprintUrl, String jiraAuthKey, Boolean allowAutoJoin, Boolean activated, Boolean closed, Boolean doDailyScrumMeeting, Boolean doDailySmallTalkMeeting, Long projectId, String projectName, RoleCode roleCode) {
        this.id = id;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.realEndDate = realEndDate;
        this.isJiraSprint = isJiraSprint;
        this.jiraSprintUrl = jiraSprintUrl;
        this.jiraAuthKey = jiraAuthKey;
        this.allowAutoJoin = allowAutoJoin;
        this.activated = activated;
        this.closed = closed;
        this.doDailyScrumMeeting = doDailyScrumMeeting;
        this.doDailySmallTalkMeeting = doDailySmallTalkMeeting;
        this.project = Project.builder().id(projectId).name(projectName).build();
        this.roleCode = roleCode;
    }

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "name", nullable = false, length = ColumnsDef.NAME)
    private String name;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "real_end_date")
    private LocalDateTime realEndDate;

    @Column(name = "is_jira_sprint")
    private Boolean isJiraSprint;

    @Length(max = 1000)
    @Column(name = "jira_sprint_url", length = ColumnsDef.URL)
    private String jiraSprintUrl;

    @Length(max = 1000)
    @Column(name = "jira_auth_key", length = ColumnsDef.TOKEN)
    private String jiraAuthKey;

    @Column(name = "allow_auto_join")
    private Boolean allowAutoJoin;

    @Column(name = "activated")
    private Boolean activated;

    @Column(name = "closed")
    private Boolean closed;

    @Column(name = "do_daily_scrum_meeting")
    private Boolean doDailyScrumMeeting;

    @Column(name = "do_daily_small_talk_meeting")
    private Boolean doDailySmallTalkMeeting;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "sprint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<SprintUser> users;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "sprint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<ScrumMeetingPlan> scrumMeetingPlans;

    @OneToMany(fetch = FetchType.EAGER, mappedBy = "sprint", cascade = CascadeType.ALL, orphanRemoval = true)
    @Fetch(value = FetchMode.SELECT)
    private List<SmallTalkMeetingPlan> smallTalkMeetingPlans;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", foreignKey = @ForeignKey(name = "FK_SPRINT__PROJECT"))
    private Project project;

    @Transient
    private RoleCode roleCode;


}
